import { formatDistanceToNow } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Users } from 'lucide-react';

const ConversationList = ({ conversations, activeConversation, onSelectConversation }) => {
  const { user } = useAuth();

  const getConversationName = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.name;
    }

    const otherParticipant = conversation.participants?.find((p) => p.id !== user.id);
    return otherParticipant?.name || 'Chat';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.avatarUrl || null;
    }

    const otherParticipant = conversation.participants?.find((p) => p.id !== user.id);
    return otherParticipant?.avatarUrl || null;
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) {
      return 'No hay mensajes aún';
    }

    const message = conversation.lastMessage;
    const isOwn = message.userId === user.id;
    const prefix = isOwn ? 'Tú: ' : '';

    if (message.type === 'image') {
      return `${prefix}📷 Imagen`;
    }

    if (message.type === 'file') {
      return `${prefix}📎 Archivo`;
    }

    return `${prefix}${message.content}`;
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Chats</h2>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <MessageCircle className="w-12 h-12 mb-2" />
          <p className="text-sm">No hay conversaciones</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {conversations.map((conversation) => {
            const isActive = activeConversation === conversation.id;
            const avatarUrl = getConversationAvatar(conversation);

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {conversation.type === 'group' ? (
                          <Users className="w-6 h-6" />
                        ) : (
                          <span className="text-lg">
                            {getConversationName(conversation).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {getConversationName(conversation)}
                      </h3>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt))}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {getLastMessagePreview(conversation)}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-semibold rounded-full px-2 py-0.5 ml-2">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
