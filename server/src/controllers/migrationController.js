import { Drug, UserSettings } from '../models/index.js';

/**
 * Migrate drugs from localStorage to database
 * Accepts an array of drugs and creates them in the database
 */
export const migrateDrugs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { drugs } = req.body;

    if (!Array.isArray(drugs)) {
      return res.status(400).json({
        success: false,
        message: 'drugs must be an array'
      });
    }

    const created = [];
    const skipped = [];
    const errors = [];

    for (const drugData of drugs) {
      try {
        // Check if drug already exists
        const existing = await Drug.findOne({
          where: {
            userId,
            name: drugData.name,
            system: drugData.system,
            subArea: drugData.subArea
          }
        });

        if (existing) {
          skipped.push({
            name: drugData.name,
            reason: 'Already exists'
          });
          continue;
        }

        // Create the drug
        const newDrug = await Drug.create({
          userId,
          isGlobal: false,
          name: drugData.name,
          dci: drugData.dci || '',
          system: drugData.system,
          subArea: drugData.subArea,
          type: drugData.type || '',
          presentation: drugData.presentation || '',
          proSections: drugData.proSections || [],
          patientSections: drugData.patientSections || {
            intro: '',
            admin: [],
            layout: []
          }
        });

        created.push(newDrug.name);
      } catch (error) {
        errors.push({
          name: drugData.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Migration complete: ${created.length} created, ${skipped.length} skipped, ${errors.length} errors`,
      created,
      skipped,
      errors
    });
  } catch (error) {
    console.error('Error migrating drugs:', error);
    res.status(500).json({
      success: false,
      message: 'Error during migration',
      error: error.message
    });
  }
};

export default { migrateDrugs };
