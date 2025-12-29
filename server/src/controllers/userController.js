import { User, ContactRequest } from '../models/index.js';
import { Op } from 'sequelize';

// Get all users (for search)
export const getUsers = async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    const where = {};

    // Search by name or email
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Exclude current user
    where.id = { [Op.ne]: req.user.id };

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
    });

    // Get contact status for each user
    const usersWithContactStatus = await Promise.all(
      users.map(async (user) => {
        const contactRequest = await ContactRequest.findOne({
          where: {
            [Op.or]: [
              { senderId: req.user.id, receiverId: user.id },
              { senderId: user.id, receiverId: req.user.id },
            ],
          },
          attributes: ['id', 'status', 'senderId', 'receiverId'],
        });

        const profile = user.getPublicProfile();

        if (!contactRequest) {
          return {
            ...profile,
            contactStatus: 'none',
            canSendRequest: true,
            canChat: false,
          };
        }

        return {
          ...profile,
          contactStatus: contactRequest.status,
          contactRequestId: contactRequest.id,
          isSender: contactRequest.senderId === req.user.id,
          canSendRequest: contactRequest.status === 'rejected',
          canChat: contactRequest.status === 'accepted',
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithContactStatus,
        total: users.length,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting users',
      error: error.message,
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user',
      error: error.message,
    });
  }
};

// Update current user
export const updateProfile = async (req, res) => {
  try {
    const { name, hospital, specialty, avatarUrl } = req.body;

    const user = await User.findByPk(req.user.id);

    await user.update({
      ...(name && { name }),
      ...(hospital !== undefined && { hospital }),
      ...(specialty !== undefined && { specialty }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// Update user status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const user = await User.findByPk(req.user.id);

    await user.update({
      status,
      lastSeen: new Date(),
    });

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message,
    });
  }
};

export default { getUsers, getUserById, updateProfile, updateStatus };
