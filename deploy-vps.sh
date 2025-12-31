#!/bin/bash

# Script de despliegue automático para InFHarma en VPS Hostinger
# Dominio: infharma.com
# IP: 72.62.150.251

set -e  # Detener si hay errores

echo "🚀 Iniciando despliegue de InFHarma..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Actualizar sistema
echo -e "${GREEN}📦 Actualizando sistema...${NC}"
apt update && apt upgrade -y

# 2. Instalar Node.js 18
echo -e "${GREEN}📦 Instalando Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 3. Instalar PostgreSQL
echo -e "${GREEN}📦 Instalando PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# 4. Instalar Nginx
echo -e "${GREEN}📦 Instalando Nginx...${NC}"
apt install -y nginx

# 5. Instalar PM2
echo -e "${GREEN}📦 Instalando PM2...${NC}"
npm install -g pm2

# 6. Instalar Git
echo -e "${GREEN}📦 Instalando Git...${NC}"
apt install -y git

# 7. Verificar instalaciones
echo -e "${GREEN}✅ Verificando instalaciones...${NC}"
node --version
npm --version
psql --version
nginx -v
pm2 --version

echo -e "${GREEN}✅ Todas las dependencias instaladas correctamente${NC}"
echo -e "${YELLOW}⚠️  Ahora necesitas configurar PostgreSQL manualmente${NC}"
echo -e "${YELLOW}Ejecuta: sudo -u postgres psql${NC}"
echo -e "${YELLOW}Luego ejecuta los comandos SQL que te proporcionaré${NC}"
