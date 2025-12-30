// Script para verificar variables de entorno
import dotenv from 'dotenv';

dotenv.config();

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('🔍 VERIFICACIÓN DE VARIABLES DE ENTORNO');
console.log('═══════════════════════════════════════════════════════');
console.log('');

console.log('📧 EMAIL CONFIGURATION:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ NO DEFINIDO');
console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ DEFINIDO (oculto)' : '❌ NO DEFINIDO');
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NO DEFINIDO');
console.log('');

console.log('🌐 ENVIRONMENT:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('');

console.log('📊 DECISIÓN DEL SISTEMA:');
if (process.env.NODE_ENV === 'production' || process.env.EMAIL_USER) {
  console.log('  ✅ USARÁ GMAIL');
  console.log('  Servicio: Gmail');
  console.log('  Usuario:', process.env.EMAIL_USER);
} else {
  console.log('  📧 USARÁ ETHEREAL (desarrollo)');
  console.log('  Razón: NODE_ENV no es production Y EMAIL_USER no está definido');
}

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('');
