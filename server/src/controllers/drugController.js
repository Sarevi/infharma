import { Drug, User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get all drugs for the current user
 * - Returns user's own drugs (including personal copies of global drugs)
 * - Plus global drugs (where user doesn't have a personal copy)
 * - Auto-syncs admin drugs to be global
 */
export const getDrugs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase().trim();
    const isAdmin = userEmail === 'admin@infharma.com';

    // Auto-sync: Mark all admin drugs as global if not already
    const adminUser = await User.findOne({
      where: {
        email: { [Op.iLike]: 'admin@infharma.com' }
      }
    });

    if (adminUser) {
      await Drug.update(
        { isGlobal: true },
        {
          where: {
            userId: adminUser.id,
            isGlobal: false
          }
        }
      );
    }

    // Get all global drugs
    const globalDrugs = await Drug.findAll({
      where: { isGlobal: true },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'email', 'name']
      }]
    });

    // Get user's own drugs (including personal copies of global drugs)
    const userDrugs = await Drug.findAll({
      where: { userId },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'email', 'name']
      }]
    });

    // Build the final list:
    // - For global drugs: show user's copy if exists, otherwise show global
    // - Add user's own non-copy drugs
    const userCopyMap = new Map();
    userDrugs.forEach(drug => {
      if (drug.originalDrugId) {
        userCopyMap.set(drug.originalDrugId, drug);
      }
    });

    const resultDrugs = [];

    // Add global drugs (or user's copy if they have one)
    globalDrugs.forEach(globalDrug => {
      const userCopy = userCopyMap.get(globalDrug.id);
      if (userCopy) {
        // User has a personal copy - use it and mark it has original
        resultDrugs.push({
          ...userCopy.toJSON(),
          hasOriginal: true,
          originalDrugId: globalDrug.id
        });
      } else {
        // No personal copy - use global drug
        resultDrugs.push({
          ...globalDrug.toJSON(),
          hasOriginal: false
        });
      }
    });

    // Add user's own drugs that are NOT copies of global drugs
    userDrugs.forEach(drug => {
      if (!drug.originalDrugId && !drug.isGlobal) {
        resultDrugs.push({
          ...drug.toJSON(),
          hasOriginal: false
        });
      }
    });

    // Sort by updated_at
    resultDrugs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({
      success: true,
      drugs: resultDrugs
    });
  } catch (error) {
    console.error('Error fetching drugs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener medicamentos',
      error: error.message
    });
  }
};

/**
 * Create a new drug
 * - If user is admin@infharma.com, automatically set isGlobal=true
 */
export const createDrug = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const {
      name,
      dci,
      system,
      subArea,
      type,
      presentation,
      proSections,
      patientSections
    } = req.body;

    // Check if user is admin to set isGlobal (case insensitive)
    const isGlobal = userEmail.toLowerCase().trim() === 'admin@infharma.com';

    const drug = await Drug.create({
      userId,
      isGlobal,
      name,
      dci,
      system,
      subArea,
      type,
      presentation,
      proSections: proSections || [],
      patientSections: patientSections || { intro: '', admin: [], layout: [], customCards: [] }
    });

    // Emit real-time notification if admin creates a global drug
    if (isGlobal) {
      const io = req.app.get('io');
      if (io) {
        io.emit('drug:created', {
          drug: { ...drug.toJSON(), hasOriginal: false }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: isGlobal ? 'Medicamento global creado' : 'Medicamento creado',
      drug: {
        ...drug.toJSON(),
        hasOriginal: false
      }
    });
  } catch (error) {
    console.error('Error creating drug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear medicamento',
      error: error.message
    });
  }
};

/**
 * Update a drug
 * - Admin can update global drugs directly
 * - Other users editing a global drug will create a personal copy
 * - Users can update their own drugs
 */
export const updateDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase().trim();
    const isAdmin = userEmail === 'admin@infharma.com';

    const drug = await Drug.findByPk(id);

    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }

    const {
      name,
      dci,
      system,
      subArea,
      type,
      presentation,
      proSections,
      patientSections
    } = req.body;

    // Case 1: Admin editing a global drug - update directly
    if (isAdmin && drug.isGlobal) {
      await drug.update({
        name: name !== undefined ? name : drug.name,
        dci: dci !== undefined ? dci : drug.dci,
        system: system !== undefined ? system : drug.system,
        subArea: subArea !== undefined ? subArea : drug.subArea,
        type: type !== undefined ? type : drug.type,
        presentation: presentation !== undefined ? presentation : drug.presentation,
        proSections: proSections !== undefined ? proSections : drug.proSections,
        patientSections: patientSections !== undefined ? patientSections : drug.patientSections
      });

      // Emit real-time update to all connected clients
      const io = req.app.get('io');
      if (io) {
        io.emit('drug:updated', {
          drugId: drug.id,
          drug: { ...drug.toJSON(), hasOriginal: false }
        });
      }

      return res.json({
        success: true,
        message: 'Medicamento global actualizado',
        drug: {
          ...drug.toJSON(),
          hasOriginal: false
        }
      });
    }

    // Case 2: User editing their own drug (not a global one)
    if (drug.userId === userId && !drug.isGlobal) {
      await drug.update({
        name: name !== undefined ? name : drug.name,
        dci: dci !== undefined ? dci : drug.dci,
        system: system !== undefined ? system : drug.system,
        subArea: subArea !== undefined ? subArea : drug.subArea,
        type: type !== undefined ? type : drug.type,
        presentation: presentation !== undefined ? presentation : drug.presentation,
        proSections: proSections !== undefined ? proSections : drug.proSections,
        patientSections: patientSections !== undefined ? patientSections : drug.patientSections
      });

      return res.json({
        success: true,
        message: 'Medicamento actualizado',
        drug: {
          ...drug.toJSON(),
          hasOriginal: !!drug.originalDrugId,
          originalDrugId: drug.originalDrugId
        }
      });
    }

    // Case 3: User editing a user copy of a global drug
    if (drug.userId === userId && drug.originalDrugId) {
      await drug.update({
        name: name !== undefined ? name : drug.name,
        dci: dci !== undefined ? dci : drug.dci,
        system: system !== undefined ? system : drug.system,
        subArea: subArea !== undefined ? subArea : drug.subArea,
        type: type !== undefined ? type : drug.type,
        presentation: presentation !== undefined ? presentation : drug.presentation,
        proSections: proSections !== undefined ? proSections : drug.proSections,
        patientSections: patientSections !== undefined ? patientSections : drug.patientSections
      });

      return res.json({
        success: true,
        message: 'Tu versión personal actualizada',
        drug: {
          ...drug.toJSON(),
          hasOriginal: true,
          originalDrugId: drug.originalDrugId
        }
      });
    }

    // Case 4: Non-admin user editing a global drug - create personal copy
    if (drug.isGlobal && !isAdmin) {
      // Check if user already has a copy
      const existingCopy = await Drug.findOne({
        where: {
          userId,
          originalDrugId: drug.id
        }
      });

      if (existingCopy) {
        // Update existing copy
        await existingCopy.update({
          name: name !== undefined ? name : existingCopy.name,
          dci: dci !== undefined ? dci : existingCopy.dci,
          system: system !== undefined ? system : existingCopy.system,
          subArea: subArea !== undefined ? subArea : existingCopy.subArea,
          type: type !== undefined ? type : existingCopy.type,
          presentation: presentation !== undefined ? presentation : existingCopy.presentation,
          proSections: proSections !== undefined ? proSections : existingCopy.proSections,
          patientSections: patientSections !== undefined ? patientSections : existingCopy.patientSections
        });

        return res.json({
          success: true,
          message: 'Tu versión personal actualizada',
          drug: {
            ...existingCopy.toJSON(),
            hasOriginal: true,
            originalDrugId: drug.id
          }
        });
      }

      // Create personal copy
      const userCopy = await Drug.create({
        userId,
        originalDrugId: drug.id,
        isGlobal: false,
        name: name !== undefined ? name : drug.name,
        dci: dci !== undefined ? dci : drug.dci,
        system: system !== undefined ? system : drug.system,
        subArea: subArea !== undefined ? subArea : drug.subArea,
        type: type !== undefined ? type : drug.type,
        presentation: presentation !== undefined ? presentation : drug.presentation,
        proSections: proSections !== undefined ? proSections : drug.proSections,
        patientSections: patientSections !== undefined ? patientSections : drug.patientSections
      });

      return res.json({
        success: true,
        message: 'Versión personal creada',
        drug: {
          ...userCopy.toJSON(),
          hasOriginal: true,
          originalDrugId: drug.id
        }
      });
    }

    // No permission
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para editar este medicamento'
    });
  } catch (error) {
    console.error('Error updating drug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar medicamento',
      error: error.message
    });
  }
};

/**
 * Delete a drug
 * - Admin can delete global drugs
 * - Users can delete their own drugs (including personal copies)
 * - Users cannot delete global drugs (they should reset to original instead)
 */
export const deleteDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase().trim();
    const isAdmin = userEmail === 'admin@infharma.com';

    const drug = await Drug.findByPk(id);

    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }

    // Admin can delete global drugs
    if (isAdmin && drug.isGlobal) {
      const drugId = drug.id;
      // Also delete all user copies of this drug
      await Drug.destroy({
        where: { originalDrugId: drug.id }
      });
      await drug.destroy();

      // Emit real-time notification to all clients
      const io = req.app.get('io');
      if (io) {
        io.emit('drug:deleted', { drugId });
      }

      return res.json({
        success: true,
        message: 'Medicamento global eliminado'
      });
    }

    // User can delete their own drugs
    if (drug.userId === userId) {
      await drug.destroy();
      return res.json({
        success: true,
        message: drug.originalDrugId ? 'Versión personal eliminada' : 'Medicamento eliminado'
      });
    }

    // No permission
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para eliminar este medicamento'
    });
  } catch (error) {
    console.error('Error deleting drug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar medicamento',
      error: error.message
    });
  }
};

/**
 * Reset a drug to original version
 * - Deletes user's personal copy and returns the original global drug
 */
export const resetDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find user's copy of the drug
    const userCopy = await Drug.findOne({
      where: {
        id,
        userId,
        originalDrugId: { [Op.ne]: null }
      }
    });

    if (!userCopy) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una versión personal de este medicamento'
      });
    }

    const originalDrugId = userCopy.originalDrugId;

    // Delete user's copy
    await userCopy.destroy();

    // Get the original global drug
    const originalDrug = await Drug.findByPk(originalDrugId, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'email', 'name']
      }]
    });

    if (!originalDrug) {
      return res.status(404).json({
        success: false,
        message: 'El medicamento original ya no existe'
      });
    }

    res.json({
      success: true,
      message: 'Restaurado a la versión original',
      drug: {
        ...originalDrug.toJSON(),
        hasOriginal: false
      }
    });
  } catch (error) {
    console.error('Error resetting drug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restaurar medicamento',
      error: error.message
    });
  }
};

/**
 * Bulk import drugs from JSON array
 * Creates multiple drugs at once with basic info
 */
export const bulkImportDrugs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { drugs } = req.body;

    if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de medicamentos'
      });
    }

    // Check if user is admin to set isGlobal
    const isGlobal = userEmail.toLowerCase().trim() === 'admin@infharma.com';

    const createdDrugs = [];
    const errors = [];

    for (let i = 0; i < drugs.length; i++) {
      const drugData = drugs[i];

      // Validate required fields
      if (!drugData.name || !drugData.name.trim()) {
        errors.push({ index: i, error: 'Nombre requerido', data: drugData });
        continue;
      }

      try {
        const drug = await Drug.create({
          userId,
          isGlobal,
          name: drugData.name.trim(),
          dci: drugData.dci?.trim() || '',
          system: drugData.system?.trim() || drugData.area?.trim() || '',
          subArea: drugData.subArea?.trim() || drugData.patologia?.trim() || '',
          type: drugData.type?.trim() || drugData.tipo?.trim() || '',
          presentation: drugData.presentation?.trim() || drugData.presentacion?.trim() || '',
          proSections: [],
          patientSections: { intro: '', admin: [], layout: [], customCards: [] }
        });

        createdDrugs.push(drug.toJSON());
      } catch (drugError) {
        errors.push({ index: i, error: drugError.message, data: drugData });
      }
    }

    // Emit real-time notification for each created drug if admin
    if (isGlobal && createdDrugs.length > 0) {
      const io = req.app.get('io');
      if (io) {
        createdDrugs.forEach(drug => {
          io.emit('drug:created', {
            drug: { ...drug, hasOriginal: false }
          });
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Importados ${createdDrugs.length} medicamentos${errors.length > 0 ? `, ${errors.length} errores` : ''}`,
      imported: createdDrugs.length,
      errors: errors.length,
      errorDetails: errors,
      drugs: createdDrugs
    });
  } catch (error) {
    console.error('Error importing drugs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar medicamentos',
      error: error.message
    });
  }
};
