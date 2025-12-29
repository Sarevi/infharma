import express from 'express';
import { getUsers, getUserById, updateProfile, updateStatus } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.put('/status', updateStatus);

export default router;
