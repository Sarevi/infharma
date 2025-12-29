import dotenv from 'dotenv';
import sequelize, { testConnection, syncDatabase } from './database.js';
import { User } from '../models/index.js';

dotenv.config();

const seedUsers = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Test connection
    await testConnection();

    // Sync database (force: true will drop and recreate tables)
    console.log('⚠️  WARNING: This will drop all existing tables and data!');
    console.log('Syncing database...\n');
    await syncDatabase(true);

    // Create test users
    const users = [
      {
        email: 'admin@infharma.com',
        password: 'admin123',
        name: 'Administrador InFHarma',
        role: 'admin',
        hospital: 'Hospital General',
        specialty: 'Farmacia Hospitalaria',
      },
      {
        email: 'maria.garcia@hospital.com',
        password: 'maria123',
        name: 'María García',
        role: 'farmaceutico',
        hospital: 'Hospital San Juan',
        specialty: 'Farmacia Clínica',
      },
      {
        email: 'juan.lopez@hospital.com',
        password: 'juan123',
        name: 'Juan López',
        role: 'farmaceutico',
        hospital: 'Hospital Universitario',
        specialty: 'Oncología',
      },
      {
        email: 'ana.martinez@hospital.com',
        password: 'ana123',
        name: 'Ana Martínez',
        role: 'farmaceutico',
        hospital: 'Hospital La Paz',
        specialty: 'Pediatría',
      },
      {
        email: 'carlos.ruiz@hospital.com',
        password: 'carlos123',
        name: 'Carlos Ruiz',
        role: 'farmaceutico',
        hospital: 'Hospital Ramón y Cajal',
        specialty: 'Farmacia Hospitalaria',
      },
    ];

    console.log('Creating users...');
    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    console.log('\n✅ Database seeded successfully!\n');
    console.log('You can now login with any of these accounts:');
    console.log('─────────────────────────────────────────────');
    users.forEach(u => {
      console.log(`Email: ${u.email}`);
      console.log(`Password: ${u.password}`);
      console.log(`Role: ${u.role}`);
      console.log('─────────────────────────────────────────────');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
