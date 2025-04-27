import React, { useState } from 'react';
import { Send, Zap } from 'lucide-react';

interface MessageProducerProps {
  onSendMessage: (message: any, random: boolean) => Promise<any>;
  darkMode: boolean;
}

const MessageProducer: React.FC<MessageProducerProps> = ({ onSendMessage, darkMode }) => {
  const [messageType, setMessageType] = useState<'custom' | 'sensor'>('sensor');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const handleSendRandomSensor = async () => {
    setSending(true);
    try {
      const response = await onSendMessage({}, true);
      setLastResponse(response);
    } catch (error) {
      console.error('Error sending random sensor data:', error);
      setLastResponse({ success: false, error: String(error) });
    } finally {
      setSending(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!customMessage.trim()) return;
    
    setSending(true);
    try {
      const response = await onSendMessage({ text: customMessage }, false);
      setLastResponse(response);
      if (response.success) {
        setCustomMessage('');
      }
    } catch (error) {
      console.error('Error sending custom message:', error);
      setLastResponse({ success: false, error: String(error) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex space-x-2 mb-2">
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              messageType === 'sensor'
                ? 'bg-purple-600 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setMessageType('sensor')}
          >
            Sensor Data
          </button>
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              messageType === 'custom'
                ? 'bg-purple-600 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setMessageType('custom')}
          >
            Custom Message
          </button>
        </div>

        {messageType === 'sensor' ? (
          <button
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center font-medium transition-colors ${
              sending
                ? 'bg-purple-700 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white`}
            onClick={handleSendRandomSensor}
            disabled={sending}
          >
            {sending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Sending...
              </>
            ) : (
              <>
                <Zap className="mr-2" size={18} />
                Generate Random Sensor Data
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter a custom message"
              className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCustomMessage()}
            />
            <button
              className={`p-2 rounded-md transition-colors ${
                sending
                  ? 'bg-purple-700 cursor-not-allowed'
                  : !customMessage.trim()
                  ? darkMode
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              onClick={handleSendCustomMessage}
              disabled={sending || !customMessage.trim()}
            >
              {sending ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Response feedback */}
      {lastResponse && (
        <div
          className={`text-sm p-3 rounded-md mt-3 ${
            lastResponse.success
              ? darkMode
                ? 'bg-green-900/30 text-green-300'
                : 'bg-green-100 text-green-800'
              : darkMode
              ? 'bg-red-900/30 text-red-300'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {lastResponse.success ? (
            <p>Message sent successfully! ID: {lastResponse.message_id}</p>
          ) : (
            <p>Error: {lastResponse.error}</p>
          )}
        </div>
      )}

      {/* Sensor types information */}
      <div className={`mt-4 p-3 rounded-md text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className="font-medium mb-2">Available Sensor Types:</h3>
        <ul className="space-y-1">
          <li>• Temperature (15-35°C)</li>
          <li>• Humidity (30-90%)</li>
          <li>• Pressure (980-1050 hPa)</li>
          <li>• CO₂ (300-1500 ppm)</li>
          <li>• Light (0-10000 lux)</li>
        </ul>
      </div>
    </div>
  );
};

export default MessageProducer;