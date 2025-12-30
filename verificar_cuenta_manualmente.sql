-- Script SQL para verificar manualmente una cuenta existente
-- Conectate a PostgreSQL y ejecuta estos comandos

-- Ver todas las cuentas no verificadas
SELECT id, name, email, email_verified, created_at
FROM users
WHERE email_verified = false
ORDER BY created_at DESC;

-- Verificar manualmente la cuenta admin@infharma.com
UPDATE users
SET email_verified = true,
    verification_token = NULL,
    verification_token_expires = NULL
WHERE email = 'admin@infharma.com';

-- Verificar manualmente la cuenta consultasfarmachuo@gmail.com
UPDATE users
SET email_verified = true,
    verification_token = NULL,
    verification_token_expires = NULL
WHERE email = 'consultasfarmachuo@gmail.com';

-- Verificar manualmente la cuenta samuelrey24@gmail.com
UPDATE users
SET email_verified = true,
    verification_token = NULL,
    verification_token_expires = NULL
WHERE email = 'samuelrey24@gmail.com';

-- Ver el resultado
SELECT id, name, email, email_verified, created_at
FROM users
ORDER BY created_at DESC;
