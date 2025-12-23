import { Message, Conversation, ConversationParticipant, User } from '../models/index.js';
import { Op } from 'sequelize';
import { getIO } from '../config/socket.js';

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0, before } = req.query;
    const userId = req.user.id;

    // Verify user is participant
    const participation = await ConversationParticipant.findOne({
      where: { conversationId, userId, leftAt: null },
    });

    if (!participation) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this conversation',
      });
    }

    const where = { conversationId };

    // Pagination: get messages before a certain timestamp
    if (before) {
      where.createdAt = { [Op.lt]: new Date(before) };
    }

    const messages = await Message.findAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatarUrl'],
        },
        {
          model: Message,
          as: 'replyToMessage',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Update last read
    await participation.update({
      lastReadAt: new Date(),
      unreadCount: 0,
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        total: messages.length,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting messages',
      error: error.message,
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', fileUrl, fileName, fileSize, replyTo } = req.body;
    const userId = req.user.id;

    // Verify user is participant
    const participation = await ConversationParticipant.findOne({
      where: { conversationId, userId, leftAt: null },
    });

    if (!participation) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this conversation',
      });
    }

    // Validate content
    if (!content && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Message content or file is required',
      });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      userId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      replyTo,
    });

    // Update conversation's last message
    await Conversation.update(
      {
        lastMessageAt: new Date(),
        lastMessageText: type === 'text' ? content : `[${type}]`,
      },
      { where: { id: conversationId } }
    );

    // Increment unread count for other participants
    await ConversationParticipant.increment('unreadCount', {
      where: {
        conversationId,
        userId: { [Op.ne]: userId },
        leftAt: null,
      },
    });

    // Fetch complete message with sender info
    const completeMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatarUrl'],
        },
        {
          model: Message,
          as: 'replyToMessage',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    // Emit to conversation room via Socket.io
    const io = getIO();
    io.to(`conversation:${conversationId}`).emit('message:new', {
      message: completeMessage,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: completeMessage,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check ownership
    if (message.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    // Update message
    await message.update({
      content,
      editedAt: new Date(),
    });

    // Fetch complete message
    const completeMessage = await Message.findByPk(messageId, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatarUrl'],
        },
      ],
    });

    // Emit update via Socket.io
    const io = getIO();
    io.to(`conversation:${message.conversationId}`).emit('message:edited', {
      message: completeMessage,
    });

    res.json({
      success: true,
      message: 'Message edited successfully',
      data: {
        message: completeMessage,
      },
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message,
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check ownership
    if (message.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    // Soft delete
    await message.destroy();

    // Emit delete via Socket.io
    const io = getIO();
    io.to(`conversation:${message.conversationId}`).emit('message:deleted', {
      messageId,
      conversationId: message.conversationId,
    });

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message,
    });
  }
};

export default { getMessages, sendMessage, editMessage, deleteMessage };
