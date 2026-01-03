import express from 'express';
import { getDrugs, createDrug, updateDrug, deleteDrug } from '../controllers/drugController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getDrugs);
router.post('/', createDrug);
router.put('/:id', updateDrug);
router.delete('/:id', deleteDrug);

export default router;
