import { useState, useEffect } from 'react';
import { X, Search, Users as UsersIcon, MessageCircle, Check } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const NewConversationModal = ({ isOpen, onClose, onConversationCreated }) => {
  const { user } = useAuth();
  const { createConversation, sendContactRequest } = useChat();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [conversationType, setConversationType] = useState('direct');
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users', {
        params: { limit: 100 },
      });
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filteredUsers = searchTerm.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const toggleUser = (userId) => {
    if (conversationType === 'direct') {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const result = await sendContactRequest(userId);
      if (result.success) {
        // Actualizar el usuario en la lista
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === userId
              ? { ...u, contactStatus: 'pending', canSendRequest: false }
              : u
          )
        );
      } else {
        setError(result.message || 'Error al enviar solicitud');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;

    if (conversationType === 'group' && !groupName.trim()) {
      alert('Por favor, ingresa un nombre para el grupo');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createConversation(
        conversationType,
        selectedUsers,
        conversationType === 'group' ? groupName : null,
        null
      );

      if (result.success) {
        onConversationCreated(result.conversation);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedUsers([]);
    setConversationType('direct');
    setGroupName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nueva conversación</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type selector */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setConversationType('direct')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                conversationType === 'direct'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat 1 a 1</span>
            </button>
            <button
              onClick={() => {
                setConversationType('group');
                setSelectedUsers([]);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                conversationType === 'group'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UsersIcon className="w-4 h-4" />
              <span>Grupo</span>
            </button>
          </div>
        </div>

        {/* Group name input */}
        {conversationType === 'group' && (
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Nombre del grupo"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500">
              {searchTerm.trim() ? 'No se encontraron usuarios' : 'Escribe para buscar usuarios...'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    selectedUsers.includes(u.id)
                      ? 'bg-blue-50 border-blue-500'
                      : 'border-transparent bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    {u.hospital && (
                      <p className="text-xs text-gray-400">{u.hospital}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleUser(u.id)}
                      className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                        selectedUsers.includes(u.id)
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {selectedUsers.includes(u.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Añadido
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-3.5 h-3.5" />
                          {conversationType === 'group' ? 'Añadir' : 'Chatear'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading
              ? 'Creando...'
              : `Crear ${conversationType === 'group' ? 'grupo' : 'chat'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
