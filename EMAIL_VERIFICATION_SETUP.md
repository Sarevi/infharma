# Sistema de Verificación de Email - InFHarma

## ✅ Implementación Completa

El sistema de verificación de email ha sido completamente implementado en frontend y backend.

### Backend (✅ Completado)
- ✅ Modelo User actualizado con campos de verificación
- ✅ Servicio de email con nodemailer configurado
- ✅ Endpoints de verificación y reenvío creados
- ✅ Tokens de verificación con expiración de 24 horas
- ✅ Control de acceso para usuarios no verificados
- ✅ Emails HTML profesionales con plantillas

### Frontend (✅ Completado)
- ✅ UI de registro con formulario completo
- ✅ Pantalla de confirmación de email enviado
- ✅ Verificación automática desde URL
- ✅ Pantalla de verificación exitosa
- ✅ Botón de reenvío de email
- ✅ Manejo de errores y tokens expirados

## 📋 Pasos para Activar el Sistema

### 1. Ejecutar Migración de Base de Datos

```bash
cd server
node src/migrations/add-email-verification.js
```

Esto agregará las columnas necesarias a la tabla `users`:
- `email_verified` (boolean, default: false)
- `verification_token` (string, nullable)
- `verification_token_expires` (date, nullable)

Los usuarios existentes serán marcados como verificados automáticamente.

### 2. Iniciar el Servidor

```bash
cd server
npm run dev
```

**¡Eso es todo!** El sistema funciona automáticamente en desarrollo usando **Ethereal**.

## 📧 Cómo Funciona en Desarrollo

### Modo Desarrollo (Predeterminado) - Ethereal

**No necesitas configurar NADA**. El sistema usa Ethereal automáticamente:

1. Cuando un usuario se registra, el servidor crea automáticamente una cuenta de prueba en Ethereal
2. El email se "envía" a Ethereal (no es real, es solo para testing)
3. **En la consola del servidor verás una URL** como:
   ```
   📧 EMAIL DE VERIFICACIÓN (Ethereal)
   ═══════════════════════════════════════════════════════
   👉 Abre este link para ver el email:
   https://ethereal.email/message/XXXXXXX
   ```
4. Haz click en esa URL para ver el email HTML completo
5. Copia el link de verificación del email y úsalo

**Ventajas:**
- ✅ Sin configuración
- ✅ Emails HTML perfectos
- ✅ No necesitas cuenta de email real
- ✅ Puedes ver todos los emails enviados

### Modo Producción - Gmail/SendGrid/Otro

Para usar emails reales en producción, configura estas variables en `/server/.env`:

```env
NODE_ENV=production
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
FRONTEND_URL=https://tu-dominio.com
```

#### Cómo obtener App Password de Gmail:
1. Ir a: https://myaccount.google.com/apppasswords
2. Si no aparece, necesitas activar la verificación en 2 pasos primero
3. Genera una contraseña para "Correo"
4. Úsala como `EMAIL_PASSWORD`

## 🔄 Flujo de Usuario

1. **Registro**: Usuario completa formulario → recibe email de verificación
2. **Email**: Usuario hace click en enlace del email
3. **Verificación**: Sistema valida token → marca cuenta como verificada → auto-login
4. **Login**: Solo usuarios verificados pueden acceder

## 🎨 Pantallas Implementadas

- **Registro**: Formulario con email, contraseña, nombre, hospital, especialidad
- **Email Enviado**: Confirmación con botón de reenvío
- **Verificando**: Loading spinner mientras verifica token
- **Verificado**: Mensaje de éxito antes de redirigir
- **Error**: Manejo de tokens expirados con opción de reenvío

## 🔧 Archivos Modificados

### Backend
- `server/src/models/User.js` - Modelo con campos de verificación
- `server/src/services/emailService.js` - Servicio de envío de emails (NUEVO)
- `server/src/controllers/authController.js` - Lógica de verificación
- `server/src/routes/auth.js` - Rutas de verificación
- `server/src/migrations/add-email-verification.js` - Script de migración (NUEVO)

### Frontend
- `client/src/App.jsx` - UI completa de verificación
- `client/src/context/AuthContext.jsx` - Métodos verifyEmail y resendVerification

## 📧 Emails de Producción

Para producción, puedes usar servicios profesionales:
- **SendGrid** (12,000 emails gratis/mes)
- **AWS SES** (62,000 emails gratis/mes)
- **Mailgun** (5,000 emails gratis/mes)

Simplemente actualiza la configuración en `emailService.js` y las variables de entorno.

## 🧪 Testing

Para probar el sistema sin configurar email real:
1. Descomenta la sección de Ethereal en `emailService.js`
2. Los emails se generarán en URLs de preview
3. Verás las URLs en la consola del servidor

## ⚠️ Notas Importantes

- Los tokens expiran en 24 horas
- Los usuarios existentes se marcan como verificados en la migración
- El login solo funciona con emails verificados
- Se puede reenviar el email de verificación si expira
