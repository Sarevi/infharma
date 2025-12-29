import express from 'express';
import {
  sendContactRequest,
  acceptContactRequest,
  rejectContactRequest,
  getPendingRequests,
  getSentRequests,
  getContacts,
  checkContactStatus,
} from '../controllers/contactRequestController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Enviar solicitud de contacto
router.post('/request', sendContactRequest);

// Obtener solicitudes recibidas pendientes
router.get('/requests/pending', getPendingRequests);

// Obtener solicitudes enviadas pendientes
router.get('/requests/sent', getSentRequests);

// Aceptar solicitud de contacto
router.put('/requests/:requestId/accept', acceptContactRequest);

// Rechazar solicitud de contacto
router.put('/requests/:requestId/reject', rejectContactRequest);

// Obtener lista de contactos aceptados
router.get('/', getContacts);

// Verificar estado de contacto con otro usuario
router.get('/status/:otherUserId', checkContactStatus);

export default router;
