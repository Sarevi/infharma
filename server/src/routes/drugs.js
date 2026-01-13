import express from 'express';
import { getDrugs, createDrug, updateDrug, deleteDrug, resetDrug, bulkImportDrugs } from '../controllers/drugController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getDrugs);
router.post('/', createDrug);
router.post('/bulk-import', bulkImportDrugs);
router.put('/:id', updateDrug);
router.delete('/:id', deleteDrug);
router.post('/:id/reset', resetDrug);

export default router;
