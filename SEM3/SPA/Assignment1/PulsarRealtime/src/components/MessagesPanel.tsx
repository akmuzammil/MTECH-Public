import React from 'react';
import { ProducedMessage } from '../App';

interface MessagesPanelProps {
  producedMessages: ProducedMessage[];
  darkMode: boolean;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ producedMessages, darkMode }) => {
  // Format timestamp to be more readable
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
  };

  return (
    <div>
      {producedMessages.length === 0 ? (
        <div className={`p-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} border border-dashed rounded-md ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          No messages produced yet
        </div>
      ) : (
        <div className={`border rounded-md overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-h-[230px] overflow-y-auto">
            {producedMessages.slice().reverse().map((message, index) => (
              <div 
                key={message.id}
                className={`p-3 ${index !== 0 ? (darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200') : ''} 
                  ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-medium truncate max-w-[180px]">
                    {message.data.device_id || 'Message'}: {message.data.sensor_type || 'Custom'}
                  </div>
                  <div className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
                    {message.topic.split('/').pop()}
                  </div>
                </div>
                
                <div className={`text-sm font-mono p-2 rounded mb-2 overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  {message.data.text ? (
                    <span>"{message.data.text}"</span>
                  ) : (
                    <span>
                      {message.data.value} {message.data.unit}
                    </span>
                  )}
                </div>
                
                <div className="text-xs opacity-60">
                  Produced at {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPanel;