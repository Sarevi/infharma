import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('member', 'admin'),
    defaultValue: 'member',
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  leftAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  unreadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'conversation_participants',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['conversation_id', 'user_id'],
    },
  ],
});

export default ConversationParticipant;
