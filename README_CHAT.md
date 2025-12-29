# InFHarma Chat - Sistema de Mensajería en Tiempo Real

## 📋 Descripción

Sistema de chat integrado en InFHarma para facilitar la comunicación entre farmacéuticos a nivel nacional. Incluye chats individuales (1-a-1) y grupos de trabajo, con soporte para mensajería en tiempo real usando WebSockets.

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- Node.js 18+ con Express.js
- PostgreSQL (base de datos relacional)
- Socket.io (WebSockets para tiempo real)
- Sequelize ORM
- JWT (autenticación)
- Bcrypt (hash de contraseñas)

**Frontend:**
- React 18 con Vite
- Tailwind CSS
- Socket.io-client
- Axios (HTTP client)
- Context API (estado global)

---

## 📁 Estructura del Proyecto

```
infharma/
├── server/                    # Backend Node.js
│   ├── src/
│   │   ├── config/           # Configuraciones (DB, Socket.io)
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── models/           # Modelos de datos (Sequelize)
│   │   ├── routes/           # Rutas de API
│   │   ├── middleware/       # Auth, errores, validaciones
│   │   ├── services/         # Servicios auxiliares
│   │   ├── utils/            # Utilidades (JWT, etc.)
│   │   └── server.js         # Punto de entrada
│   ├── package.json
│   └── .env                  # Variables de entorno
│
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   └── Chat/         # Componentes del chat
│   │   ├── context/          # Context API (Auth, Chat)
│   │   ├── api/              # Cliente HTTP (Axios)
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utilidades
│   │   └── App.jsx           # Componente principal
│   ├── package.json
│   └── vite.config.js        # Configuración Vite + Proxy
│
└── README_CHAT.md            # Esta documentación
```

---

## 🚀 Instalación y Configuración

### 1. Requisitos Previos

```bash
- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm o yarn
```

### 2. Configurar Base de Datos

Crear base de datos en PostgreSQL:

```sql
CREATE DATABASE infharma_db;
CREATE USER postgres WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE infharma_db TO postgres;
```

### 3. Instalar Dependencias

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 4. Configurar Variables de Entorno

Copiar el archivo `.env.example` y renombrar a `.env` en la carpeta `server/`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=infharma_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# JWT Configuration
JWT_SECRET=cambia-esto-por-una-clave-secreta-fuerte
JWT_REFRESH_SECRET=cambia-esto-por-otra-clave-secreta
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
```

### 5. Inicializar Base de Datos

**Opción A: Seed de datos de prueba (Recomendado para desarrollo)**

```bash
cd server
npm run seed
```

Esto creará:
- Tablas automáticamente
- 5 usuarios de prueba (admin + 4 farmacéuticos)

**Opción B: Solo sincronizar tablas**

Las tablas se crearán automáticamente al iniciar el servidor en modo desarrollo.

### 6. Iniciar el Sistema

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Verás:
```
═══════════════════════════════════════════════════════
🚀 InFHarma Backend Server
═══════════════════════════════════════════════════════
📍 Environment: development
🌐 Server running on: http://localhost:3001
💾 Database: PostgreSQL (infharma_db)
🔌 Socket.IO: Enabled
⚡ API Health: http://localhost:3001/health
═══════════════════════════════════════════════════════
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Acceder a: **http://localhost:5173**

---

## 🔐 Usuarios de Prueba

Después de ejecutar `npm run seed`, puedes usar estas credenciales:

| Email | Password | Role |
|-------|----------|------|
| admin@infharma.com | admin123 | admin |
| maria.garcia@hospital.com | maria123 | farmaceutico |
| juan.lopez@hospital.com | juan123 | farmaceutico |
| ana.martinez@hospital.com | ana123 | farmaceutico |
| carlos.ruiz@hospital.com | carlos123 | farmaceutico |

---

## 📡 API REST Endpoints

### Autenticación

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "name": "Nombre Completo",
  "hospital": "Hospital General",
  "specialty": "Farmacia Clínica"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### Usuarios

```http
GET /api/users?search=maria&limit=50
Authorization: Bearer {accessToken}
```

```http
GET /api/users/:id
Authorization: Bearer {accessToken}
```

```http
PUT /api/users/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "hospital": "Hospital Nuevo"
}
```

```http
PUT /api/users/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "online" | "offline" | "away"
}
```

### Conversaciones

```http
GET /api/conversations
Authorization: Bearer {accessToken}
```

```http
POST /api/conversations
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "direct" | "group",
  "participantIds": ["uuid1", "uuid2"],
  "name": "Nombre del Grupo" // Solo para grupos
}
```

```http
GET /api/conversations/:id
Authorization: Bearer {accessToken}
```

```http
DELETE /api/conversations/:id
Authorization: Bearer {accessToken}
```

### Mensajes

```http
GET /api/messages/:conversationId?limit=50&before=2024-01-01
Authorization: Bearer {accessToken}
```

```http
POST /api/messages/:conversationId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "Texto del mensaje",
  "type": "text" | "image" | "file",
  "replyTo": "uuid" // Opcional
}
```

```http
PUT /api/messages/:messageId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "Texto editado"
}
```

```http
DELETE /api/messages/:messageId
Authorization: Bearer {accessToken}
```

---

## 🔌 Socket.IO Events

### Cliente → Servidor

```javascript
// Conectar con autenticación
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});

// Unirse a una conversación
socket.emit('conversation:join', conversationId);

// Salir de una conversación
socket.emit('conversation:leave', conversationId);

// Indicador de escritura (empezar)
socket.emit('typing:start', { conversationId });

// Indicador de escritura (detener)
socket.emit('typing:stop', { conversationId });

// Estado online
socket.emit('user:online');
```

### Servidor → Cliente

```javascript
// Conexión exitosa
socket.on('connect', () => {
  console.log('Conectado!');
});

// Nuevo mensaje
socket.on('message:new', ({ message }) => {
  console.log('Nuevo mensaje:', message);
});

// Mensaje editado
socket.on('message:edited', ({ message }) => {
  console.log('Mensaje editado:', message);
});

// Mensaje eliminado
socket.on('message:deleted', ({ messageId, conversationId }) => {
  console.log('Mensaje eliminado:', messageId);
});

// Nueva conversación
socket.on('conversation:new', ({ conversation }) => {
  console.log('Nueva conversación:', conversation);
});

// Usuario escribiendo
socket.on('typing:start', ({ userId, conversationId }) => {
  console.log('Usuario escribiendo:', userId);
});

socket.on('typing:stop', ({ userId, conversationId }) => {
  console.log('Usuario dejó de escribir:', userId);
});

// Estado de usuario
socket.on('user:status', ({ userId, status }) => {
  console.log('Estado de usuario:', userId, status);
});
```

---

## 💾 Modelo de Datos

### User (users)
```
- id (UUID)
- email (unique)
- password (hash)
- name
- role (farmaceutico | admin)
- hospital
- specialty
- status (online | offline | away)
- last_seen
- avatar_url
- created_at
- updated_at
```

### Conversation (conversations)
```
- id (UUID)
- type (direct | group)
- name (para grupos)
- description
- avatar_url
- created_by (User ID)
- last_message_at
- last_message_text
- created_at
- updated_at
```

### ConversationParticipant (conversation_participants)
```
- id (UUID)
- conversation_id
- user_id
- role (member | admin)
- last_read_at
- joined_at
- left_at
- unread_count
- created_at
- updated_at
```

### Message (messages)
```
- id (UUID)
- conversation_id
- user_id
- content
- type (text | image | file | system)
- file_url
- file_name
- file_size
- edited_at
- deleted_at (soft delete)
- reply_to (Message ID)
- created_at
- updated_at
```

---

## 🔒 Seguridad

### Autenticación
- JWT con tokens de acceso (24h) y refresco (7d)
- Contraseñas hasheadas con bcrypt (12 rounds)
- Refresh token rotation

### Autorización
- Middleware de autenticación en todas las rutas protegidas
- Verificación de participación en conversaciones
- Solo propietarios pueden editar/borrar mensajes

### Rate Limiting
- 100 requests / 15 minutos por IP
- Configurable en `.env`

### Validación
- Validación de inputs con express-validator
- Sanitización de mensajes (prevenir XSS)
- CORS configurado

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Probar autenticación
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infharma.com","password":"admin123"}'

# Obtener usuario actual
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer {tu-token}"
```

---

## 📊 Monitoreo

### Logs
El servidor muestra logs en desarrollo:
- Conexiones/desconexiones de Socket.io
- Queries SQL (Sequelize)
- Errores detallados

### Base de Datos
```sql
-- Usuarios activos
SELECT COUNT(*) FROM users WHERE status = 'online';

-- Mensajes por día
SELECT DATE(created_at), COUNT(*)
FROM messages
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Conversaciones más activas
SELECT c.id, c.name, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id
ORDER BY message_count DESC
LIMIT 10;
```

---

## 🚢 Despliegue a Producción

### Opción 1: Railway.app (Recomendado)

1. Crear cuenta en [Railway.app](https://railway.app)
2. Conectar repositorio Git
3. Agregar PostgreSQL database
4. Configurar variables de entorno
5. Deploy automático

**Variables de entorno en producción:**
```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://tu-dominio.com
DB_HOST={railway-db-host}
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD={railway-db-password}
JWT_SECRET={generar-clave-segura}
JWT_REFRESH_SECRET={generar-clave-segura}
```

### Opción 2: VPS (Hetzner, DigitalOcean)

```bash
# Instalar Node.js y PostgreSQL
# Clonar repositorio
# Configurar variables de entorno
# Iniciar con PM2
npm install -g pm2
pm2 start server/src/server.js --name infharma-backend
pm2 startup
pm2 save
```

---

## 🛠️ Troubleshooting

### Error: "Unable to connect to the database"
- Verificar que PostgreSQL está corriendo
- Revisar credenciales en `.env`
- Verificar que la base de datos existe

### Error: "Socket connection refused"
- Verificar que el backend está corriendo en puerto 3001
- Revisar configuración de proxy en `vite.config.js`

### Error: "Token expired"
- El token de acceso expira cada 24h
- Usar el refresh token para obtener uno nuevo

### Los mensajes no llegan en tiempo real
- Verificar conexión de Socket.io en el navegador (Network tab)
- Revisar que el usuario se unió a la conversación
- Comprobar logs del servidor

---

## 📝 Roadmap Futuro

- [ ] Envío de imágenes y archivos
- [ ] Notificaciones push
- [ ] Búsqueda de mensajes
- [ ] Mensajes de voz
- [ ] Videollamadas (WebRTC)
- [ ] Cifrado end-to-end
- [ ] Exportar conversaciones

---

## 👥 Soporte

Para dudas o problemas:
- Crear issue en el repositorio
- Email: consultasfarmachuo@gmail.com

---

## 📄 Licencia

MIT License - InFHarma Team 2024
