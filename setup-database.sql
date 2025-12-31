-- Script de configuración de base de datos PostgreSQL para InFHarma
-- Ejecutar como usuario postgres: sudo -u postgres psql < setup-database.sql

-- Crear base de datos
CREATE DATABASE infharma_db;

-- Crear usuario
CREATE USER infharma_user WITH ENCRYPTED PASSWORD 'InFh@rma2024!Secure';

-- Dar privilegios
GRANT ALL PRIVILEGES ON DATABASE infharma_db TO infharma_user;

-- Conectar a la base de datos
\c infharma_db

-- Dar permisos sobre el schema public
GRANT ALL ON SCHEMA public TO infharma_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO infharma_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO infharma_user;

-- Configurar permisos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO infharma_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO infharma_user;

-- Salir
\q
