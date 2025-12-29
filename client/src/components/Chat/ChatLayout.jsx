import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewConversationModal from './NewConversationModal';
import PendingRequests from './PendingRequests';

const ChatLayout = ({ onClose }) => {
  const {
    conversations,
    activeConversation,
    fetchConversations,
    fetchMessages,
    joinConversation,
    leaveConversation,
  } = useChat();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectConversation = (conversation) => {
    // Leave previous conversation
    if (selectedConversation) {
      leaveConversation(selectedConversation.id);
    }

    // Join new conversation
    setSelectedConversation(conversation);
    joinConversation(conversation.id);
    fetchMessages(conversation.id);
  };

  const handleConversationCreated = (conversation) => {
    handleSelectConversation(conversation);
  };

  return (
    <>
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Chat InFHarma</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              title="Nueva conversación"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              title="Cerrar chat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Chat content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel with pending requests and conversations */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <PendingRequests />
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          {/* Right panel with chat window */}
          <ChatWindow conversation={selectedConversation} />
        </div>
      </div>

      {/* New conversation modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={handleConversationCreated}
      />
    </>
  );
};

export default ChatLayout;
