import express from 'express';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);

export default router;
