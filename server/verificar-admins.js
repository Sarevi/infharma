// Script para verificar usuarios administradores
import dotenv from 'dotenv';
import sequelize, { testConnection } from './src/config/database.js';
import { User } from './src/models/index.js';

dotenv.config();

const verificarAdmins = async () => {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔐 VERIFICACIÓN DE USUARIOS ADMINISTRADORES');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // Test connection
    await testConnection();

    // Lista de emails de administradores
    const adminEmails = [
      'admin@infharma.com',
      'maria.garcia@hospital.com'
    ];

    console.log('Verificando usuarios administradores...\n');

    // Actualizar usuarios
    const [numUpdated] = await User.update(
      {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null
      },
      {
        where: {
          email: adminEmails
        }
      }
    );

    console.log(`✅ ${numUpdated} usuario(s) actualizado(s)\n`);

    // Mostrar usuarios verificados
    const users = await User.findAll({
      where: {
        email: adminEmails
      },
      attributes: ['name', 'email', 'role', 'emailVerified', 'createdAt']
    });

    console.log('Usuarios administradores:');
    console.log('─────────────────────────────────────────────');
    users.forEach(user => {
      console.log(`Nombre: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Rol: ${user.role}`);
      console.log(`Email verificado: ${user.emailVerified ? '✅ SÍ' : '❌ NO'}`);
      console.log('─────────────────────────────────────────────');
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Ahora puedes hacer login con:');
    console.log('');
    console.log('Usuario 1:');
    console.log('  Email: admin@infharma.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Usuario 2:');
    console.log('  Email: maria.garcia@hospital.com');
    console.log('  Password: maria123');
    console.log('');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
};

verificarAdmins();
