-- Script para verificar usuarios administradores predefinidos
-- Estos usuarios no necesitan verificación de email porque son administradores del sistema

-- Verificar admin@infharma.com
UPDATE users
SET
  email_verified = true,
  verification_token = NULL,
  verification_token_expires = NULL
WHERE email = 'admin@infharma.com';

-- Verificar maria.garcia@hospital.com
UPDATE users
SET
  email_verified = true,
  verification_token = NULL,
  verification_token_expires = NULL
WHERE email = 'maria.garcia@hospital.com';

-- Mostrar resultado
SELECT
  name,
  email,
  role,
  email_verified,
  created_at
FROM users
WHERE email IN ('admin@infharma.com', 'maria.garcia@hospital.com')
ORDER BY email;
