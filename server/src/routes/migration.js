import express from 'express';
import { migrateDrugs } from '../controllers/migrationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Migrate drugs from localStorage to database
router.post('/drugs', authenticate, migrateDrugs);

export default router;
