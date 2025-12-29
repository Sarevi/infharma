import { formatDistanceToNow } from '../../utils/dateUtils';

const MessageBubble = ({ message, isOwn, sender }) => {
  const bubbleClass = isOwn
    ? 'bg-blue-600 text-white ml-auto'
    : 'bg-gray-100 text-gray-900';

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date));
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} mb-4`}>
      {!isOwn && sender && (
        <span className="text-xs text-gray-500 mb-1 px-2">{sender.name}</span>
      )}
      <div className={`rounded-2xl px-4 py-2 ${bubbleClass}`}>
        {message.replyToMessage && (
          <div className="bg-black bg-opacity-10 rounded-lg p-2 mb-2 text-sm">
            <div className="font-medium">{message.replyToMessage.sender?.name}</div>
            <div className="opacity-75 truncate">{message.replyToMessage.content}</div>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </span>
          {message.editedAt && (
            <span className={`text-xs italic ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
              (editado)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
