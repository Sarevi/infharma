// Script de prueba para debuggear nodemailer
console.log('🔍 Testing nodemailer import...\n');

async function testNodemailer() {
  try {
    // Test 1: Import dinámico
    console.log('1. Testing dynamic import...');
    const imported = await import('nodemailer');
    console.log('   - imported:', Object.keys(imported));
    console.log('   - imported.default:', typeof imported.default);
    console.log('   - imported.default.createTransport:', typeof imported.default?.createTransport);
    console.log('   - imported.createTransport:', typeof imported.createTransport);

    // Test 2: Intentar crear transporter
    console.log('\n2. Testing createTransport...');
    let nodemailer = imported.default || imported;

    if (typeof nodemailer.createTransport !== 'function') {
      console.log('   ❌ createTransport NO es una función');
      console.log('   Tipo de nodemailer:', typeof nodemailer);
      console.log('   Propiedades:', Object.keys(nodemailer).slice(0, 10));

      // Intentar acceder de diferentes formas
      if (imported.default && imported.default.default) {
        nodemailer = imported.default.default;
        console.log('   Intentando imported.default.default...');
      } else if (imported.createTransport) {
        nodemailer = imported;
        console.log('   Usando imported directamente...');
      }
    }

    if (typeof nodemailer.createTransport === 'function') {
      console.log('   ✅ createTransport encontrado!');

      // Test 3: Crear un transporter de prueba
      console.log('\n3. Creating test transporter...');
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('   ✅ Transporter creado exitosamente!');

      // Test 4: Enviar email de prueba
      console.log('\n4. Sending test email...');
      const info = await transporter.sendMail({
        from: '"Test" <test@example.com>',
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test',
      });

      console.log('   ✅ Email enviado!');
      console.log('   Message ID:', info.messageId);

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('   Preview URL:', previewUrl);
      }

      console.log('\n✅ TODO FUNCIONA CORRECTAMENTE!\n');
      return true;
    } else {
      console.log('   ❌ No se pudo encontrar createTransport\n');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testNodemailer().then(success => {
  process.exit(success ? 0 : 1);
});
