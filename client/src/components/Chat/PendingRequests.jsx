import { Check, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const PendingRequests = () => {
  const { pendingRequests, acceptContactRequest, rejectContactRequest } = useChat();

  if (!pendingRequests || pendingRequests.length === 0) {
    return null;
  }

  const handleAccept = async (requestId) => {
    const result = await acceptContactRequest(requestId);
    if (!result.success) {
      alert(result.message || 'Error al aceptar solicitud');
    }
  };

  const handleReject = async (requestId) => {
    const result = await rejectContactRequest(requestId);
    if (!result.success) {
      alert(result.message || 'Error al rechazar solicitud');
    }
  };

  return (
    <div className="border-b border-gray-200 bg-amber-50 p-3">
      <h3 className="text-sm font-semibold text-amber-900 mb-2">
        Solicitudes de contacto ({pendingRequests.length})
      </h3>
      <div className="space-y-2">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {request.sender.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{request.sender.name}</p>
              <p className="text-xs text-gray-500 truncate">{request.sender.email}</p>
              {request.sender.hospital && (
                <p className="text-xs text-gray-400 truncate">{request.sender.hospital}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleAccept(request.id)}
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                title="Aceptar"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(request.id)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="Rechazar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingRequests;
