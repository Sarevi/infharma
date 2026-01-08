import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Users, X, Crown } from 'lucide-react';

const ChatWindow = ({ conversation }) => {
  const { user } = useAuth();
  const { messages, sendMessage, typingUsers, startTyping, stopTyping } = useChat();
  const messagesEndRef = useRef(null);
  const [showParticipants, setShowParticipants] = useState(false);

  const conversationMessages = messages[conversation?.id] || [];
  const typingInConversation = typingUsers[conversation?.id] || [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSendMessage = async (content) => {
    if (!conversation) return;

    await sendMessage(conversation.id, content);
  };

  const handleTyping = (isTyping) => {
    if (!conversation) return;

    if (isTyping) {
      startTyping(conversation.id);
    } else {
      stopTyping(conversation.id);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Selecciona una conversación</p>
          <p className="text-sm">Elige un chat para empezar a conversar</p>
        </div>
      </div>
    );
  }

  const getConversationName = () => {
    if (conversation.type === 'group') {
      return conversation.name;
    }

    const otherParticipant = conversation.participants?.find((p) => p.id !== user.id);
    return otherParticipant?.name || 'Chat';
  };

  const getTypingIndicator = () => {
    if (typingInConversation.length === 0) return null;

    const typingUserNames = conversation.participants
      ?.filter((p) => typingInConversation.includes(p.id))
      .map((p) => p.name.split(' ')[0]);

    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} está escribiendo...`;
    }

    if (typingUserNames.length === 2) {
      return `${typingUserNames.join(' y ')} están escribiendo...`;
    }

    return 'Varios usuarios están escribiendo...';
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{getConversationName()}</h2>
        {conversation.type === 'group' && (
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
          >
            <Users size={14} />
            {conversation.participants?.length || 0} participantes
          </button>
        )}
      </div>

      {/* Participants Panel */}
      {showParticipants && conversation.type === 'group' && (
        <div className="absolute right-0 top-16 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 m-4">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users size={18} />
              Participantes ({conversation.participants?.length || 0})
            </h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {conversation.participants?.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {participant.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate flex items-center gap-1">
                    {participant.name}
                    {participant.id === user.id && (
                      <span className="text-xs text-gray-500">(Tú)</span>
                    )}
                    {conversation.createdBy === participant.id && (
                      <Crown size={14} className="text-amber-500" title="Creador del grupo" />
                    )}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                  {participant.hospital && (
                    <p className="text-xs text-gray-400 truncate">{participant.hospital}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No hay mensajes aún. ¡Envía el primero!</p>
          </div>
        ) : (
          <>
            {conversationMessages.map((message) => {
              const isOwn = message.userId === user.id;
              const sender = conversation.participants?.find((p) => p.id === message.userId);

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  sender={!isOwn ? sender : null}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing indicator */}
        {typingInConversation.length > 0 && (
          <div className="text-sm text-gray-500 italic px-2">{getTypingIndicator()}</div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;
