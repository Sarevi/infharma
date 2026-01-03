import { UserSettings } from '../models/index.js';

/**
 * Get user settings
 * - Creates default settings if they don't exist
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

    res.json({
      success: true,
      settings: {
        customAreas: settings.customAreas,
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
      if (customAreas !== undefined) updates.customAreas = customAreas;
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
