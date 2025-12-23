# 🚀 Inicio Rápido - InFHarma Chat

## ✅ Pre-requisitos

Antes de empezar, asegúrate de tener instalado:

1. **PostgreSQL** - Base de datos
   - Descarga: https://www.postgresql.org/download/
   - O usa Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Node.js 18+**
   - Verifica: `node --version`
   - Si no está instalado: https://nodejs.org/

---

## 🎯 Pasos para Iniciar (Primera Vez)

### 1. Configurar PostgreSQL

Si usas Docker:
```bash
docker run --name infharma-postgres \
  -e POSTGRES_DB=infharma_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres
```

Si usas PostgreSQL instalado:
```sql
CREATE DATABASE infharma_db;
```

### 2. Las dependencias ya están instaladas ✅

No necesitas ejecutar `npm install`, ya está hecho.

### 3. Crear Usuarios de Prueba

```bash
cd server
npm run seed
```

Esto creará 5 usuarios:
- **admin@infharma.com** / admin123 (Admin)
- **maria.garcia@hospital.com** / maria123
- **juan.lopez@hospital.com** / juan123
- **ana.martinez@hospital.com** / ana123
- **carlos.ruiz@hospital.com** / carlos123

---

## 🎬 Iniciar la Aplicación

### Opción A: Iniciar Todo Junto (Recomendado)

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto iniciará:
- ✅ Backend en http://localhost:3001
- ✅ Frontend en http://localhost:5173

### Opción B: Iniciar Por Separado

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

---

## 🔐 Acceder a la Aplicación

1. Abre tu navegador en **http://localhost:5173**

2. Inicia sesión con:
   - Email: `admin@infharma.com`
   - Password: `admin123`

3. ¡Listo! Verás tu aplicación InFHarma con el botón de chat flotante 💬

---

## 💬 Usar el Chat

1. Haz clic en el **botón azul flotante** (esquina inferior derecha)

2. Haz clic en el botón **"+"** para crear una nueva conversación

3. Busca a otros usuarios y selecciona:
   - **Chat 1 a 1**: Para chat privado con un usuario
   - **Grupo**: Para crear un grupo con múltiples usuarios

4. ¡Empieza a chatear!

---

## 🧪 Probar con Múltiples Usuarios

Para probar el chat en tiempo real:

1. Abre una **ventana de incógnito** en tu navegador

2. Inicia sesión con otro usuario (ej: maria.garcia@hospital.com / maria123)

3. Crea una conversación entre los dos usuarios

4. ¡Envía mensajes y verás la sincronización en tiempo real!

---

## ❓ Problemas Comunes

### "Unable to connect to database"
```bash
# Verifica que PostgreSQL esté corriendo
docker ps  # Si usas Docker
# O
pg_isready  # Si usas PostgreSQL instalado

# Verifica las credenciales en server/.env
```

### "Port 3001 already in use"
```bash
# Encuentra y mata el proceso
lsof -i :3001
kill -9 <PID>

# O cambia el puerto en server/.env
PORT=3002
```

### "Port 5173 already in use"
```bash
# Cierra otras ventanas de Vite
# O presiona Ctrl+C en la terminal del frontend
```

### El chat no se conecta
1. Verifica que el backend esté corriendo en el puerto 3001
2. Abre las DevTools (F12) → Console para ver errores
3. Verifica que estés autenticado (el botón de chat solo aparece si estás logueado)

---

## 📋 Comandos Útiles

```bash
# Instalar todo de cero
npm run install-all

# Solo backend
npm run server

# Solo frontend
npm run client

# Recrear base de datos con datos de prueba
cd server && npm run seed

# Build para producción
npm run build
```

---

## 📚 Más Información

- **Documentación completa**: Ver `README_CHAT.md`
- **API endpoints**: Sección "API REST Endpoints" en README_CHAT.md
- **Modelo de datos**: Sección "Modelo de Datos" en README_CHAT.md

---

## 🎉 ¡Todo Listo!

Tu aplicación InFHarma ahora tiene:
- ✅ Sistema de autenticación con JWT
- ✅ Chat en tiempo real con Socket.io
- ✅ Chats individuales (1-a-1)
- ✅ Grupos de trabajo
- ✅ Indicadores de "escribiendo..."
- ✅ Estados online/offline
- ✅ Historial permanente de mensajes
- ✅ Interfaz tipo WhatsApp

**¡Disfruta tu nueva funcionalidad de chat!** 💙
