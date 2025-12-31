#!/bin/bash

# Script para generar secretos JWT seguros
echo "Generando secretos JWT seguros..."
echo ""
echo "JWT_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""
echo "JWT_REFRESH_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""
echo "DB_PASSWORD (sugerido):"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""
echo "Copia estos valores a tu archivo .env.production"
