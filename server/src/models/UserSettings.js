import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserSettings = sequelize.define('UserSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  customAreas: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Custom clinical areas and sub-areas defined by user',
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL of hospital logo',
  },
  primaryColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'indigo',
    comment: 'Primary color theme for the interface',
  },
}, {
  tableName: 'user_settings',
  timestamps: true,
  underscored: true,
});

export default UserSettings;
