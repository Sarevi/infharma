// Usar createRequire para importar nodemailer (fix para ES modules)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');

import crypto from 'crypto';

// Configuración del transportador de email
// IMPORTANTE: Configurar variables de entorno en producción
const createTransporter = async () => {
  // En producción, usar servicio real (Gmail, SendGrid, AWS SES, etc.)
  if (process.env.NODE_ENV === 'production' || process.env.EMAIL_USER) {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // En desarrollo SIN configuración: usar Ethereal automáticamente
  // Ethereal crea cuentas de prueba temporales y muestra URLs de preview
  console.log('📧 Usando Ethereal para emails de desarrollo...');
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Generar token de verificación único
 */
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Enviar email de verificación
 */
export const sendVerificationEmail = async (email, name, verificationToken) => {
  const transporter = await createTransporter();

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"InFHarma" <${process.env.EMAIL_USER || 'noreply@infharma.com'}>`,
    to: email,
    subject: 'Verifica tu cuenta de InFHarma',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .button:hover { background: #5568d3; }
          .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a InFHarma!</h1>
          </div>
          <div class="content">
            <h2>Hola ${name},</h2>
            <p>Gracias por registrarte en InFHarma, la plataforma de consulta farmacéutica inteligente.</p>
            <p>Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de correo electrónico haciendo click en el siguiente botón:</p>
            <center>
              <a href="${verificationUrl}" class="button">Verificar mi email</a>
            </center>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${verificationUrl}
            </p>
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
            <p>Si no creaste una cuenta en InFHarma, puedes ignorar este mensaje.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
            <p>Saludos,<br><strong>El equipo de InFHarma</strong></p>
          </div>
          <div class="footer">
            <p>InFHarma - Consulta Farmacéutica Inteligente</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hola ${name},

Gracias por registrarte en InFHarma.

Para verificar tu email, visita este enlace:
${verificationUrl}

Este enlace expirará en 24 horas.

Si no creaste una cuenta en InFHarma, puedes ignorar este mensaje.

Saludos,
El equipo de InFHarma
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de verificación enviado:', info.messageId);

    // En desarrollo con Ethereal, muestra URL de preview
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📧 EMAIL DE VERIFICACIÓN (Ethereal)');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Para:', email);
      console.log('');
      console.log('👉 Abre este link para ver el email:');
      console.log(previewUrl);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Enviar email de bienvenida (después de verificar)
 */
export const sendWelcomeEmail = async (email, name) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"InFHarma" <${process.env.EMAIL_USER || 'noreply@infharma.com'}>`,
    to: email,
    subject: '¡Cuenta activada! Bienvenido a InFHarma',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ¡Cuenta Activada!</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${name}!</h2>
            <p>Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades de InFHarma:</p>
            <ul>
              <li>📋 Consulta protocolos farmacéuticos</li>
              <li>💬 Chatea con otros profesionales</li>
              <li>📄 Crea y edita documentos</li>
              <li>📊 Accede a calculadoras clínicas</li>
            </ul>
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Ir a InFHarma</a>
            </center>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>Saludos,<br><strong>El equipo de InFHarma</strong></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de bienvenida enviado:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
    return { success: false, error: error.message };
  }
};

export default {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
};
