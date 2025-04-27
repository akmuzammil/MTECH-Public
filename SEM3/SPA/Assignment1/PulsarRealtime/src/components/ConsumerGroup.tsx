import React from 'react';
import { Users } from 'lucide-react';
import { ConsumedMessage } from '../App';

interface ConsumerGroupProps {
  title: string;
  description: string;
  messages: ConsumedMessage[];
  groupId: string;
  consumedCount: number;
  darkMode: boolean;
}

const ConsumerGroup: React.FC<ConsumerGroupProps> = ({
  title,
  description,
  messages,
  groupId,
  consumedCount,
  darkMode
}) => {
  // Get color based on consumer group
  const getBadgeColor = () => {
    switch (groupId) {
      case 'group1':
        return darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'group2':
        return darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800';
      case 'group3':
        return darkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate latency for each message
  const calculateLatency = (producedAt: string, consumedAt: string) => {
    const produced = new Date(producedAt).getTime();
    const consumed = new Date(consumedAt).getTime();
    return consumed - produced;
  };

  // Format timestamp to be more readable
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
  };

  return (
    <div className={`p-6 rounded-lg shadow-md h-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold flex items-center">
          <Users className="mr-2" size={22} />
          {title}
        </h2>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor()}`}>
          {consumedCount} msgs
        </span>
      </div>
      
      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>
      
      <div className={`border rounded-md overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {messages.length === 0 ? (
          <div className={`p-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No messages consumed yet
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {messages.slice().reverse().map((message, index) => {
              const latency = calculateLatency(message.produced_at, message.consumed_at);
              
              return (
                <div 
                  key={`${message.id}-${index}`}
                  className={`p-3 ${index !== 0 ? (darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200') : ''} 
                    ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-medium truncate max-w-[180px]">
                      {message.data.device_id || 'Message'}: {message.data.sensor_type || 'Custom'}
                    </div>
                    <div className={`text-xs px-1.5 py-0.5 rounded ${
                      latency < 500 
                        ? darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                        : latency < 2000
                        ? darkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-800'
                        : darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                      {latency}ms
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
                    Consumed at {formatTime(message.consumed_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerGroup;