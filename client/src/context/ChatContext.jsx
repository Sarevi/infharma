import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import apiClient from '../api/client';
import * as contactsAPI from '../api/contacts';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      socketInstance.emit('user:online');
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // User status events
    socketInstance.on('user:status', ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    // New conversation
    socketInstance.on('conversation:new', ({ conversation }) => {
      setConversations((prev) => [conversation, ...prev]);
    });

    // New message
    socketInstance.on('message:new', ({ message }) => {
      setMessages((prev) => ({
        ...prev,
        [message.conversationId]: [...(prev[message.conversationId] || []), message],
      }));

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt }
            : conv
        )
      );
    });

    // Message edited
    socketInstance.on('message:edited', ({ message }) => {
      setMessages((prev) => ({
        ...prev,
        [message.conversationId]: (prev[message.conversationId] || []).map((msg) =>
          msg.id === message.id ? message : msg
        ),
      }));
    });

    // Message deleted
    socketInstance.on('message:deleted', ({ messageId, conversationId }) => {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter((msg) => msg.id !== messageId),
      }));
    });

    // Typing indicators
    socketInstance.on('typing:start', ({ userId, conversationId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), userId],
      }));
    });

    socketInstance.on('typing:stop', ({ userId, conversationId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter((id) => id !== userId),
      }));
    });

    // Contact request events
    socketInstance.on('contact:request:received', ({ request }) => {
      setPendingRequests((prev) => [request, ...prev]);
      // Notificación visual
      if (Notification.permission === 'granted') {
        new Notification('Nueva solicitud de contacto', {
          body: `${request.sender.name} te ha enviado una solicitud de contacto`,
          icon: request.sender.avatarUrl,
        });
      }
    });

    socketInstance.on('contact:request:accepted', ({ request }) => {
      // Actualizar estado si es necesario
      console.log('Contact request accepted:', request);
    });

    socketInstance.on('contact:request:rejected', ({ requestId }) => {
      console.log('Contact request rejected:', requestId);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);

  // Calculate total unread count
  useEffect(() => {
    const total = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
    setTotalUnreadCount(total);
  }, [conversations]);

  // Fetch pending contact requests
  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await contactsAPI.getPendingRequests();
      setPendingRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  }, []);

  // Load pending requests when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingRequests();
    }
  }, [isAuthenticated, fetchPendingRequests]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await apiClient.get('/conversations');
      setConversations(response.data.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await apiClient.get(`/messages/${conversationId}`);
      setMessages((prev) => ({
        ...prev,
        [conversationId]: response.data.data.messages,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Create conversation
  const createConversation = useCallback(async (type, participantIds, name, description) => {
    try {
      const response = await apiClient.post('/conversations', {
        type,
        participantIds,
        name,
        description,
      });
      const newConversation = response.data.data.conversation;

      if (response.data.data.isNew) {
        setConversations((prev) => [newConversation, ...prev]);
      }

      return { success: true, conversation: newConversation };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear conversación',
      };
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (conversationId, content, type = 'text') => {
    try {
      const response = await apiClient.post(`/messages/${conversationId}`, {
        content,
        type,
      });
      return { success: true, message: response.data.data.message };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al enviar mensaje',
      };
    }
  }, []);

  // Join conversation room
  const joinConversation = useCallback(
    (conversationId) => {
      if (socket && conversationId) {
        socket.emit('conversation:join', conversationId);
        setActiveConversation(conversationId);
      }
    },
    [socket]
  );

  // Leave conversation room
  const leaveConversation = useCallback(
    (conversationId) => {
      if (socket && conversationId) {
        socket.emit('conversation:leave', conversationId);
      }
    },
    [socket]
  );

  // Typing indicators
  const startTyping = useCallback(
    (conversationId) => {
      if (socket && conversationId) {
        socket.emit('typing:start', { conversationId });
      }
    },
    [socket]
  );

  const stopTyping = useCallback(
    (conversationId) => {
      if (socket && conversationId) {
        socket.emit('typing:stop', { conversationId });
      }
    },
    [socket]
  );

  // Contact request functions
  const sendContactRequest = useCallback(async (receiverId) => {
    try {
      const response = await contactsAPI.sendContactRequest(receiverId);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending contact request:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al enviar solicitud',
      };
    }
  }, []);

  const acceptContactRequest = useCallback(async (requestId) => {
    try {
      const response = await contactsAPI.acceptContactRequest(requestId);
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error accepting contact request:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al aceptar solicitud',
      };
    }
  }, []);

  const rejectContactRequest = useCallback(async (requestId) => {
    try {
      const response = await contactsAPI.rejectContactRequest(requestId);
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error rejecting contact request:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al rechazar solicitud',
      };
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        socket,
        conversations,
        activeConversation,
        messages,
        onlineUsers,
        typingUsers,
        isConnected,
        pendingRequests,
        totalUnreadCount,
        fetchConversations,
        fetchMessages,
        fetchPendingRequests,
        createConversation,
        sendMessage,
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
        sendContactRequest,
        acceptContactRequest,
        rejectContactRequest,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
