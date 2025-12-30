// Migration to add email verification fields to users table
// Run this with: node src/migrations/add-email-verification.js

import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const addEmailVerificationFields = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('🔄 Iniciando migración: Agregar campos de verificación de email...');

    // Check if columns already exist
    const tableDescription = await queryInterface.describeTable('users');

    if (!tableDescription.email_verified) {
      await queryInterface.addColumn('users', 'email_verified', {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
      console.log('✅ Columna email_verified agregada');
    } else {
      console.log('ℹ️  Columna email_verified ya existe');
    }

    if (!tableDescription.verification_token) {
      await queryInterface.addColumn('users', 'verification_token', {
        type: DataTypes.STRING,
        allowNull: true,
      });
      console.log('✅ Columna verification_token agregada');
    } else {
      console.log('ℹ️  Columna verification_token ya existe');
    }

    if (!tableDescription.verification_token_expires) {
      await queryInterface.addColumn('users', 'verification_token_expires', {
        type: DataTypes.DATE,
        allowNull: true,
      });
      console.log('✅ Columna verification_token_expires agregada');
    } else {
      console.log('ℹ️  Columna verification_token_expires ya existe');
    }

    // Set existing users as verified (retroactive compatibility)
    await sequelize.query(`
      UPDATE users
      SET email_verified = true
      WHERE email_verified IS NULL OR email_verified = false
    `);
    console.log('✅ Usuarios existentes marcados como verificados');

    console.log('🎉 Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
};

addEmailVerificationFields();
