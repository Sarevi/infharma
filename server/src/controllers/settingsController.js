import { UserSettings, Drug } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get user settings
 * - Creates default settings if they don't exist
 * - Auto-syncs customAreas from user's drugs
 */
export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    let settings = await UserSettings.findOne({
      where: { userId }
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await UserSettings.create({
        userId,
        customAreas: {},
        logoUrl: '',
        primaryColor: 'indigo'
      });
    }

    // AUTO-SYNC: Build customAreas from user's drugs + global drugs
    const drugs = await Drug.findAll({
      where: {
        [Op.or]: [
          { userId },
          { isGlobal: true }
        ]
      }
    });

    // Build areas map from drugs
    const areasFromDrugs = {};
    drugs.forEach(drug => {
      if (drug.system && drug.subArea) {
        if (!areasFromDrugs[drug.system]) {
          areasFromDrugs[drug.system] = { subAreas: [] };
        }
        if (!areasFromDrugs[drug.system].subAreas.includes(drug.subArea)) {
          areasFromDrugs[drug.system].subAreas.push(drug.subArea);
        }
      }
    });

    // Merge with existing customAreas (preserve user-created empty areas)
    const existingAreas = settings.customAreas || {};
    const mergedAreas = { ...areasFromDrugs };

    // Add empty areas that user created manually
    Object.keys(existingAreas).forEach(areaName => {
      if (!mergedAreas[areaName]) {
        mergedAreas[areaName] = existingAreas[areaName];
      } else {
        // Merge subAreas
        const existingSubAreas = existingAreas[areaName].subAreas || [];
        existingSubAreas.forEach(subArea => {
          if (!mergedAreas[areaName].subAreas.includes(subArea)) {
            mergedAreas[areaName].subAreas.push(subArea);
          }
        });
      }
    });

    // Update settings if changed
    const areasChanged = JSON.stringify(settings.customAreas) !== JSON.stringify(mergedAreas);
    if (areasChanged) {
      settings.customAreas = mergedAreas;
      settings.changed('customAreas', true);
      await settings.save();
    }

    res.json({
      success: true,
      settings: {
        customAreas: mergedAreas,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración',
      error: error.message
    });
  }
};

/**
 * Update user settings
 * - Updates only provided fields
 */
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { customAreas, logoUrl, primaryColor } = req.body;

    let settings = await UserSettings.findOne({
      where: { userId }
    });

    // Create if doesn't exist
    if (!settings) {
      settings = await UserSettings.create({
        userId,
        customAreas: customAreas || {},
        logoUrl: logoUrl || '',
        primaryColor: primaryColor || 'indigo'
      });
    } else {
      // Update only provided fields
      const updates = {};
      if (customAreas !== undefined) {
        updates.customAreas = customAreas;
        // Force Sequelize to recognize JSONB field change
        settings.changed('customAreas', true);
      }
      if (logoUrl !== undefined) updates.logoUrl = logoUrl;
      if (primaryColor !== undefined) updates.primaryColor = primaryColor;

      await settings.update(updates);
    }

    res.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      settings: {
        customAreas: settings.customAreas,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración',
      error: error.message
    });
  }
};

export default {
  getSettings,
  updateSettings,
};
