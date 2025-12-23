import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('direct', 'group'),
    allowNull: false,
    defaultValue: 'direct',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name for group conversations',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastMessageText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'conversations',
  timestamps: true,
});

export default Conversation;
