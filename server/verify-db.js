import sequelize from './src/config/database.js';
import './src/models/index.js';

async function verifyDatabase() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    console.log('Verificando tablas...');
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Tablas existentes:');
    results.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check for user_settings specifically
    const hasUserSettings = results.some(row => row.table_name === 'user_settings');

    if (hasUserSettings) {
      console.log('\n✅ La tabla user_settings existe');

      // Count records
      const [count] = await sequelize.query('SELECT COUNT(*) as count FROM user_settings');
      console.log(`   Registros en user_settings: ${count[0].count}`);
    } else {
      console.log('\n❌ La tabla user_settings NO existe');
      console.log('   Ejecutando sincronización...');
      await sequelize.sync({ alter: true });
      console.log('   ✅ Tablas sincronizadas');
    }

    await sequelize.close();
    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
