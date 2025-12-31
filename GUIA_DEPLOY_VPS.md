# Guía Completa: Deploy en Hostinger VPS

## REQUISITOS PREVIOS
- VPS Hostinger KVM1 activo
- Acceso SSH (IP, usuario, contraseña)
- Node.js 18+ instalado en tu PC local
- Git instalado

---

## PARTE 1: CONFIGURACIÓN INICIAL DEL VPS

### 1.1 Conectar al VPS por SSH

Desde tu PC (PowerShell o terminal):

```bash
ssh root@TU_IP_VPS
# Ingresa tu contraseña cuando te lo pida
```

### 1.2 Actualizar el sistema

```bash
apt update && apt upgrade -y
```

### 1.3 Crear usuario no-root (seguridad)

```bash
adduser infharma
usermod -aG sudo infharma
su - infharma
```

---

## PARTE 2: INSTALAR SOFTWARE NECESARIO

### 2.1 Instalar Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar (debe ser v18.x)
npm --version
```

### 2.2 Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.3 Instalar Nginx (servidor web)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.4 Instalar PM2 (gestor de procesos Node.js)

```bash
sudo npm install -g pm2
```

### 2.5 Instalar Git

```bash
sudo apt install -y git
```

---

## PARTE 3: CONFIGURAR POSTGRESQL

### 3.1 Crear usuario y base de datos

```bash
sudo -u postgres psql

# Dentro de PostgreSQL:
CREATE USER infharma_user WITH PASSWORD 'TU_CONTRASEÑA_SEGURA';
CREATE DATABASE infharma_db OWNER infharma_user;
GRANT ALL PRIVILEGES ON DATABASE infharma_db TO infharma_user;
\q
```

### 3.2 Verificar conexión

```bash
psql -U infharma_user -d infharma_db -h localhost
# Ingresa la contraseña
\q
```

---

## PARTE 4: CLONAR EL PROYECTO

### 4.1 Clonar desde GitHub

```bash
cd ~
git clone https://github.com/Sarevi/infharma.git
cd infharma
```

### 4.2 Configurar variables de entorno

```bash
cd server
nano .env
```

Pega el contenido de `.env.production` y modifica:
- `TU_IP_O_DOMINIO` → Tu IP del VPS (ejemplo: 123.45.67.89)
- `DB_PASSWORD` → La contraseña que creaste para PostgreSQL
- `JWT_SECRET` → Generar con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `JWT_REFRESH_SECRET` → Generar otro diferente

Guarda con `Ctrl+X`, `Y`, `Enter`

---

## PARTE 5: CONFIGURAR EL BACKEND

### 5.1 Instalar dependencias

```bash
cd ~/infharma/server
npm install --production
```

### 5.2 Ejecutar migraciones

```bash
npm run migrate
```

### 5.3 (Opcional) Crear usuarios de prueba

```bash
npm run seed
```

### 5.4 Crear directorio de uploads

```bash
mkdir -p uploads
chmod 755 uploads
```

### 5.5 Iniciar con PM2

```bash
pm2 start src/server.js --name infharma-backend
pm2 save
pm2 startup
# Ejecuta el comando que te muestre PM2
```

### 5.6 Verificar que funciona

```bash
pm2 status
pm2 logs infharma-backend
curl http://localhost:3001/health
```

---

## PARTE 6: CONFIGURAR EL FRONTEND

### 6.1 Configurar variables de entorno

```bash
cd ~/infharma/client
nano .env.production
```

Pega:
```
VITE_API_URL=http://TU_IP:3001
VITE_SOCKET_URL=http://TU_IP:3001
```

Cambia `TU_IP` por la IP de tu VPS.

### 6.2 Instalar dependencias y build

```bash
npm install
npm run build
```

Esto crea la carpeta `dist/` con los archivos estáticos.

---

## PARTE 7: CONFIGURAR NGINX

### 7.1 Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/infharma
```

Pega esta configuración:

```nginx
server {
    listen 80;
    server_name TU_IP_O_DOMINIO;

    # Frontend (React)
    location / {
        root /home/infharma/infharma/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket (Socket.IO)
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Cambia `TU_IP_O_DOMINIO` por tu IP o dominio.

### 7.2 Activar la configuración

```bash
sudo ln -s /etc/nginx/sites-available/infharma /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar sintaxis
sudo systemctl restart nginx
```

---

## PARTE 8: CONFIGURAR FIREWALL

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS (para después)
sudo ufw enable
sudo ufw status
```

---

## PARTE 9: PROBAR LA APLICACIÓN

Abre en tu navegador:
```
http://TU_IP_VPS
```

Deberías ver InFHarma funcionando.

---

## PARTE 10: CONFIGURAR SSL/HTTPS (OPCIONAL)

### 10.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 Obtener certificado SSL

```bash
sudo certbot --nginx -d tu-dominio.com
```

Sigue las instrucciones. Certbot configurará automáticamente Nginx.

---

## MANTENIMIENTO

### Ver logs del backend:
```bash
pm2 logs infharma-backend
```

### Reiniciar backend:
```bash
pm2 restart infharma-backend
```

### Actualizar código:
```bash
cd ~/infharma
git pull origin claude/add-chat-feature-IHW0M

# Backend
cd server
npm install --production
pm2 restart infharma-backend

# Frontend
cd ../client
npm install
npm run build
```

### Ver estado de servicios:
```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

---

## SOLUCIÓN DE PROBLEMAS

### Backend no arranca:
```bash
pm2 logs infharma-backend --lines 100
```

### Nginx error:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### PostgreSQL error:
```bash
sudo -u postgres psql -c "SELECT version();"
```

---

## RESPALDO DE BASE DE DATOS

### Crear backup:
```bash
pg_dump -U infharma_user -h localhost infharma_db > backup-$(date +%Y%m%d).sql
```

### Restaurar backup:
```bash
psql -U infharma_user -h localhost infharma_db < backup-20250101.sql
```
