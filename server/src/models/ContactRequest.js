import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ContactRequest = sequelize.define('ContactRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  }
}, {
  tableName: 'contact_requests',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['sender_id', 'receiver_id']
    },
    {
      fields: ['receiver_id', 'status']
    },
    {
      fields: ['sender_id', 'status']
    }
  ]
});

export default ContactRequest;
