import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/', authenticate, getSettings);
router.put('/', authenticate, updateSettings);

export default router;
