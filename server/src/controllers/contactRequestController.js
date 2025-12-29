import { User, ContactRequest } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Enviar solicitud de contacto
 */
export const sendContactRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    // Validar que no sea el mismo usuario
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes enviarte una solicitud a ti mismo',
      });
    }

    // Verificar que el receptor existe
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar si ya existe una solicitud pendiente o aceptada
    const existingRequest = await ContactRequest.findOne({
      where: {
        [Op.or]: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
        ],
        status: { [Op.in]: ['pending', 'accepted'] },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Ya son contactos',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Ya existe una solicitud pendiente',
      });
    }

    // Crear la solicitud
    const request = await ContactRequest.create({
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
    });

    // Cargar datos del sender para enviar en la respuesta
    const requestWithDetails = await ContactRequest.findByPk(request.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatarUrl'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'avatarUrl'] },
      ],
    });

    // Emitir evento Socket.io para notificar al receptor
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${receiverId}`).emit('contact:request:received', {
        request: requestWithDetails,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Solicitud enviada correctamente',
      data: requestWithDetails,
    });
  } catch (error) {
    console.error('Error sending contact request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al enviar la solicitud',
    });
  }
};

/**
 * Aceptar solicitud de contacto
 */
export const acceptContactRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await ContactRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatarUrl'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'avatarUrl'] },
      ],
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
      });
    }

    // Verificar que el usuario es el receptor
    if (request.receiver_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para aceptar esta solicitud',
      });
    }

    // Verificar que está pendiente
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud ya fue procesada',
      });
    }

    // Actualizar estado
    request.status = 'accepted';
    await request.save();

    // Emitir evento Socket.io para notificar al sender
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.sender_id}`).emit('contact:request:accepted', {
        request,
      });
    }

    return res.json({
      success: true,
      message: 'Solicitud aceptada',
      data: request,
    });
  } catch (error) {
    console.error('Error accepting contact request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al aceptar la solicitud',
    });
  }
};

/**
 * Rechazar solicitud de contacto
 */
export const rejectContactRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await ContactRequest.findByPk(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
      });
    }

    // Verificar que el usuario es el receptor
    if (request.receiver_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para rechazar esta solicitud',
      });
    }

    // Verificar que está pendiente
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud ya fue procesada',
      });
    }

    // Actualizar estado
    request.status = 'rejected';
    await request.save();

    // Emitir evento Socket.io para notificar al sender (opcional)
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.sender_id}`).emit('contact:request:rejected', {
        requestId: request.id,
      });
    }

    return res.json({
      success: true,
      message: 'Solicitud rechazada',
      data: request,
    });
  } catch (error) {
    console.error('Error rejecting contact request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar la solicitud',
    });
  }
};

/**
 * Obtener solicitudes pendientes (recibidas)
 */
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await ContactRequest.findAll({
      where: {
        receiver_id: userId,
        status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'hospital', 'specialty'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes pendientes',
    });
  }
};

/**
 * Obtener solicitudes enviadas
 */
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await ContactRequest.findAll({
      where: {
        sender_id: userId,
        status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'hospital', 'specialty'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Error getting sent requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes enviadas',
    });
  }
};

/**
 * Obtener lista de contactos aceptados
 */
export const getContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar solicitudes aceptadas donde el usuario es sender o receiver
    const requests = await ContactRequest.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId },
        ],
        status: 'accepted',
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'hospital', 'specialty', 'status'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'hospital', 'specialty', 'status'],
        },
      ],
    });

    // Extraer los contactos (el otro usuario en cada solicitud)
    const contacts = requests.map((request) => {
      if (request.sender_id === userId) {
        return request.receiver;
      } else {
        return request.sender;
      }
    });

    return res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error('Error getting contacts:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener contactos',
    });
  }
};

/**
 * Verificar si dos usuarios son contactos
 */
export const checkContactStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const request = await ContactRequest.findOne({
      where: {
        [Op.or]: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId },
        ],
      },
      attributes: ['id', 'status', 'sender_id', 'receiver_id'],
    });

    if (!request) {
      return res.json({
        success: true,
        data: {
          isContact: false,
          status: 'none',
          canSendRequest: true,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        isContact: request.status === 'accepted',
        status: request.status,
        requestId: request.id,
        isSender: request.sender_id === userId,
        canSendRequest: request.status === 'rejected',
      },
    });
  } catch (error) {
    console.error('Error checking contact status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar estado de contacto',
    });
  }
};
