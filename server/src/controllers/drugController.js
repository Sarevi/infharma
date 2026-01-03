import { Drug, User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get all drugs for the current user
 * - Returns user's own drugs
 * - Plus global drugs created by admin users
 */
export const getDrugs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get drugs that belong to user OR are global
    const drugs = await Drug.findAll({
      where: {
        [Op.or]: [
          { userId }, // User's own drugs
          { isGlobal: true } // Global drugs from admin
        ]
      },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'email', 'name']
      }],
      order: [['updated_at', 'DESC']]
    });

    res.json({
      success: true,
      drugs
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

    // Check if user is admin to set isGlobal
    const isGlobal = userEmail === 'admin@infharma.com';

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
      patientSections: patientSections || { intro: '', admin: [], layout: [] }
    });

    res.status(201).json({
      success: true,
      message: isGlobal ? 'Medicamento global creado' : 'Medicamento creado',
      drug
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
 * - User can only update their own drugs
 * - Admin can update global drugs
 */
export const updateDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const drug = await Drug.findByPk(id);

    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }

    // Check ownership or admin global permission
    if (drug.userId !== userId && !(drug.isGlobal && userEmail === 'admin@infharma.com')) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar este medicamento'
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

    res.json({
      success: true,
      message: 'Medicamento actualizado',
      drug
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
 * - User can only delete their own drugs
 * - Admin can delete global drugs
 */
export const deleteDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const drug = await Drug.findByPk(id);

    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }

    // Check ownership or admin global permission
    if (drug.userId !== userId && !(drug.isGlobal && userEmail === 'admin@infharma.com')) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este medicamento'
      });
    }

    await drug.destroy();

    res.json({
      success: true,
      message: 'Medicamento eliminado'
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
