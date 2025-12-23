import express from 'express';
import {
  getConversations,
  createConversation,
  getConversationById,
  leaveConversation,
} from '../controllers/conversationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversationById);
router.delete('/:id', leaveConversation);

export default router;
