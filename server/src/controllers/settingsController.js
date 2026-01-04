import { UserSettings, Drug, User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get user settings
 * - Creates default settings if they don't exist
 * - GLOBAL DATA: Areas, pathologies, and drugs from admin@infharma.com are visible to ALL users
 * - LOCAL DATA: Each user can add their own areas, pathologies, and drugs (only visible to them)
 */
export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase().trim();
    const isAdmin = userEmail === 'admin@infharma.com';

    // Get or create user settings
    let settings = await UserSettings.findOne({
      where: { userId }
    });

    if (!settings) {
      settings = await UserSettings.create({
        userId,
        customAreas: {},
        logoUrl: '',
        primaryColor: 'indigo'
      });
    }

    // Find admin user
    const adminUser = await User.findOne({
      where: {
        email: { [Op.iLike]: 'admin@infharma.com' }
      }
    });

    // Mark all admin drugs as global (backward compatibility)
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

    // ============================================
    // STEP 1: Get ADMIN's customAreas (GLOBAL areas/pathologies)
    // ============================================
    let adminAreas = {};
    if (adminUser && !isAdmin) {
      const adminSettings = await UserSettings.findOne({
        where: { userId: adminUser.id }
      });
      if (adminSettings && adminSettings.customAreas) {
        adminAreas = adminSettings.customAreas;
      }
    }

    // ============================================
    // STEP 2: Get all drugs (user's own + global from admin)
    // ============================================
    const drugs = await Drug.findAll({
      where: {
        [Op.or]: [
          { userId },
          { isGlobal: true }
        ]
      }
    });

    console.log(`[getSettings] User: ${userEmail}, isAdmin: ${isAdmin}`);
    console.log(`[getSettings] Found ${drugs.length} drugs`);
    console.log(`[getSettings] Admin areas:`, adminAreas);

    // ============================================
    // STEP 3: Build areas from drugs
    // ============================================
    const areasFromDrugs = {};
    drugs.forEach(drug => {
      if (drug.system) {
        if (!areasFromDrugs[drug.system]) {
          areasFromDrugs[drug.system] = { subAreas: [] };
        }
        if (drug.subArea && !areasFromDrugs[drug.system].subAreas.includes(drug.subArea)) {
          areasFromDrugs[drug.system].subAreas.push(drug.subArea);
        }
      }
    });

    // ============================================
    // STEP 4: Merge all areas
    // Priority: adminAreas + areasFromDrugs + userAreas
    // ============================================
    const userAreas = settings.customAreas || {};
    const mergedAreas = {};

    // First, add admin areas (global)
    Object.keys(adminAreas).forEach(areaName => {
      mergedAreas[areaName] = {
        subAreas: [...(adminAreas[areaName].subAreas || [])]
      };
    });

    // Then, add/merge areas from drugs
    Object.keys(areasFromDrugs).forEach(areaName => {
      if (!mergedAreas[areaName]) {
        mergedAreas[areaName] = { subAreas: [] };
      }
      areasFromDrugs[areaName].subAreas.forEach(subArea => {
        if (!mergedAreas[areaName].subAreas.includes(subArea)) {
          mergedAreas[areaName].subAreas.push(subArea);
        }
      });
    });

    // Finally, add/merge user's own areas (local)
    Object.keys(userAreas).forEach(areaName => {
      if (!mergedAreas[areaName]) {
        mergedAreas[areaName] = { subAreas: [] };
      }
      (userAreas[areaName].subAreas || []).forEach(subArea => {
        if (!mergedAreas[areaName].subAreas.includes(subArea)) {
          mergedAreas[areaName].subAreas.push(subArea);
        }
      });
    });

    console.log(`[getSettings] Merged areas:`, mergedAreas);

    // Don't save merged areas to user's settings (keep their data separate)
    // Only return the merged view

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
 * - Admin changes are global, user changes are local
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
