import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Drug = sequelize.define('Drug', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  isGlobal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if drug is created by admin and visible to all users',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dci: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  system: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Clinical area (e.g., Digestivo, Dermatología)',
  },
  subArea: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Pathology within clinical area',
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  presentation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Custom update date in DD/MM/YYYY format',
  },
  proSections: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Protocol sections (JSON array)',
  },
  patientSections: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: { intro: '', admin: [], layout: [] },
    comment: 'Patient information sections (JSON object)',
  },
}, {
  tableName: 'drugs',
  timestamps: true,
  underscored: true,
});

export default Drug;
