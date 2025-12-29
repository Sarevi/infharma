import apiClient from './client';

/**
 * Enviar solicitud de contacto
 */
export const sendContactRequest = async (receiverId) => {
  const response = await apiClient.post('/contacts/request', { receiverId });
  return response.data;
};

/**
 * Aceptar solicitud de contacto
 */
export const acceptContactRequest = async (requestId) => {
  const response = await apiClient.put(`/contacts/requests/${requestId}/accept`);
  return response.data;
};

/**
 * Rechazar solicitud de contacto
 */
export const rejectContactRequest = async (requestId) => {
  const response = await apiClient.put(`/contacts/requests/${requestId}/reject`);
  return response.data;
};

/**
 * Obtener solicitudes recibidas pendientes
 */
export const getPendingRequests = async () => {
  const response = await apiClient.get('/contacts/requests/pending');
  return response.data;
};

/**
 * Obtener solicitudes enviadas pendientes
 */
export const getSentRequests = async () => {
  const response = await apiClient.get('/contacts/requests/sent');
  return response.data;
};

/**
 * Obtener lista de contactos aceptados
 */
export const getContacts = async () => {
  const response = await apiClient.get('/contacts');
  return response.data;
};

/**
 * Verificar estado de contacto con otro usuario
 */
export const checkContactStatus = async (otherUserId) => {
  const response = await apiClient.get(`/contacts/status/${otherUserId}`);
  return response.data;
};
