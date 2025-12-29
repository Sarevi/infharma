import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatWindow = ({ conversation }) => {
  const { user } = useAuth();
  const { messages, sendMessage, typingUsers, startTyping, stopTyping } = useChat();
  const messagesEndRef = useRef(null);

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
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{getConversationName()}</h2>
        {conversation.type === 'group' && (
          <p className="text-sm text-gray-500">
            {conversation.participants?.length || 0} participantes
          </p>
        )}
      </div>

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
