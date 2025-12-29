import { Conversation, ConversationParticipant, User, Message } from '../models/index.js';
import { Op } from 'sequelize';
import { getIO } from '../config/socket.js';

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await ConversationParticipant.findAll({
      where: { userId, leftAt: null },
      include: [
        {
          model: Conversation,
          as: 'conversation',
          include: [
            {
              model: User,
              as: 'participants',
              through: {
                where: { leftAt: null },
                attributes: [],
              },
              attributes: { exclude: ['password'] },
            },
            {
              model: Message,
              as: 'messages',
              limit: 1,
              order: [['created_at', 'DESC']],
              include: [
                {
                  model: User,
                  as: 'sender',
                  attributes: ['id', 'name', 'avatarUrl'],
                },
              ],
            },
          ],
        },
      ],
      order: [[{ model: Conversation, as: 'conversation' }, 'last_message_at', 'DESC NULLS LAST']],
    });

    const conversations = participations.map(p => {
      const conv = p.conversation;
      const otherParticipants = conv.participants.filter(u => u.id !== userId);

      return {
        id: conv.id,
        type: conv.type,
        name: conv.type === 'group' ? conv.name : otherParticipants[0]?.name,
        description: conv.description,
        avatarUrl: conv.type === 'group' ? conv.avatarUrl : otherParticipants[0]?.avatarUrl,
        participants: conv.participants.map(u => u.getPublicProfile()),
        lastMessage: conv.messages[0] || null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: p.unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    res.json({
      success: true,
      data: {
        conversations,
        total: conversations.length,
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting conversations',
      error: error.message,
    });
  }
};

// Create new conversation
export const createConversation = async (req, res) => {
  try {
    const { type, participantIds, name, description } = req.body;
    const creatorId = req.user.id;

    // Validate type
    if (!['direct', 'group'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation type',
      });
    }

    // Validate participants
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one participant is required',
      });
    }

    // For direct conversations, check if one already exists
    if (type === 'direct') {
      if (participantIds.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Direct conversations must have exactly one other participant',
        });
      }

      const otherUserId = participantIds[0];

      // Find existing direct conversation
      const existingConv = await ConversationParticipant.findAll({
        where: { userId: creatorId },
        include: [
          {
            model: Conversation,
            as: 'conversation',
            where: { type: 'direct' },
            include: [
              {
                model: ConversationParticipant,
                as: 'participantsList',
                where: { userId: otherUserId },
              },
            ],
          },
        ],
      });

      if (existingConv.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'Conversation already exists',
          data: {
            conversation: existingConv[0].conversation,
            isNew: false,
          },
        });
      }
    }

    // Group conversations require a name
    if (type === 'group' && !name) {
      return res.status(400).json({
        success: false,
        message: 'Group conversations require a name',
      });
    }

    // Create conversation
    const conversation = await Conversation.create({
      type,
      name,
      description,
      createdBy: creatorId,
    });

    // Add creator as admin
    await ConversationParticipant.create({
      conversationId: conversation.id,
      userId: creatorId,
      role: 'admin',
    });

    // Add other participants
    for (const participantId of participantIds) {
      await ConversationParticipant.create({
        conversationId: conversation.id,
        userId: participantId,
        role: 'member',
      });
    }

    // Fetch complete conversation with participants
    const completeConversation = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] },
          attributes: { exclude: ['password'] },
        },
      ],
    });

    // Emit socket event to all participants
    const io = getIO();
    participantIds.forEach(participantId => {
      io.to(`user:${participantId}`).emit('conversation:new', {
        conversation: completeConversation,
      });
    });

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: {
        conversation: completeConversation,
        isNew: true,
      },
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message,
    });
  }
};

// Get conversation by ID
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is participant
    const participation = await ConversationParticipant.findOne({
      where: { conversationId: id, userId, leftAt: null },
    });

    if (!participation) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant of this conversation',
      });
    }

    const conversation = await Conversation.findByPk(id, {
      include: [
        {
          model: User,
          as: 'participants',
          through: {
            where: { leftAt: null },
            attributes: ['role', 'joinedAt'],
          },
          attributes: { exclude: ['password'] },
        },
      ],
    });

    res.json({
      success: true,
      data: {
        conversation,
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting conversation',
      error: error.message,
    });
  }
};

// Delete/leave conversation
export const leaveConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const participation = await ConversationParticipant.findOne({
      where: { conversationId: id, userId, leftAt: null },
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: 'Participation not found',
      });
    }

    await participation.update({ leftAt: new Date() });

    res.json({
      success: true,
      message: 'Left conversation successfully',
    });
  } catch (error) {
    console.error('Leave conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving conversation',
      error: error.message,
    });
  }
};

export default { getConversations, createConversation, getConversationById, leaveConversation };
