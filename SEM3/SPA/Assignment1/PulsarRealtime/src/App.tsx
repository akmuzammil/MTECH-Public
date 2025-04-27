import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  BarChart3, 
  Clock, 
  Activity, 
  ArrowRightCircle, 
  RadioTower, 
  Wifi, 
  Server, 
  Users, 
  MessageSquare, 
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import PulsarLogo from './components/PulsarLogo';
import MessageProducer from './components/MessageProducer';
import ConsumerGroup from './components/ConsumerGroup';
import StatsPanel from './components/StatsPanel';
import MessagesPanel from './components/MessagesPanel';
import SystemStatus from './components/SystemStatus';
import MessageFlow from './components/MessageFlow';

// Define message interfaces
interface SensorData {
  device_id?: string;
  sensor_type?: string;
  value?: number;
  unit?: string;
  timestamp?: string;
  text?: string;
  [key: string]: any;
}

export interface ProducedMessage {
  id: string;
  data: SensorData;
  timestamp: string;
  topic: string;
}

export interface ConsumedMessage {
  id: string;
  data: SensorData;
  produced_at: string;
  consumed_at: string;
  consumer_group: string;
}

export interface Stats {
  produced_count: number;
  consumed_count: {
    group1: number;
    group2: number;
    group3: number;
  };
  avg_latency_ms: number;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [connected, setConnected] = useState(false);
  const [producedMessages, setProducedMessages] = useState<ProducedMessage[]>([]);
  const [consumedMessages, setConsumedMessages] = useState<{
    group1: ConsumedMessage[];
    group2: ConsumedMessage[];
    group3: ConsumedMessage[];
  }>({
    group1: [],
    group2: [],
    group3: []
  });
  const [stats, setStats] = useState<Stats>({
    produced_count: 0,
    consumed_count: {
      group1: 0,
      group2: 0,
      group3: 0
    },
    avg_latency_ms: 0
  });

  const socketRef = useRef<any>(null);

  // Connect to the Python backend via WebSocket
  useEffect(() => {
    // Use the appropriate URL for the backend
    const SOCKET_URL = "http://localhost:5000";
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('Connected to WebSocket server');
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    socketRef.current.on('initial_state', (data: any) => {
      setStats(data.stats);
      setProducedMessages(data.recent_produced);
      setConsumedMessages(data.recent_consumed);
    });

    socketRef.current.on('new_message_produced', (message: ProducedMessage) => {
      setProducedMessages(prev => {
        const newMessages = [...prev, message];
        // Keep only the most recent 50 messages
        return newMessages.slice(-50);
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        produced_count: prev.produced_count + 1
      }));
    });

    socketRef.current.on('message_consumed', (message: ConsumedMessage) => {
      const group = message.consumer_group;
      
      setConsumedMessages(prev => {
        const newMessages = {
          ...prev,
          [group]: [...prev[group as keyof typeof prev], message].slice(-50)
        };
        return newMessages;
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        consumed_count: {
          ...prev.consumed_count,
          [group]: prev.consumed_count[group as keyof typeof prev.consumed_count] + 1
        }
      }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleSendMessage = async (messageData: any, random: boolean = false) => {
    try {
      const response = await fetch('http://localhost:5000/api/produce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageData,
          random: random,
          topic: 'persistent://public/default/sensors'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: String(error) };
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg">
        <div className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <PulsarLogo className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Apache Pulsar Demo</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <SystemStatus connected={connected} />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 md:px-6">
        {/* Introduction */}
        <div className={`mb-8 p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-3 flex items-center">
            <RadioTower className="mr-2" size={24} />
            Real-time Apache Pulsar Messaging Demo
          </h2>
          <p className="mb-4">
            This demo showcases Apache Pulsar's real-time messaging capabilities with producers sending messages and multiple consumer groups receiving them with different subscription patterns.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="font-semibold flex items-center">
                <Wifi className="mr-2" size={18} />
                Producer
              </h3>
              <p className="text-sm mt-1">Sends messages to topics with guaranteed delivery</p>
            </div>
            <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="font-semibold flex items-center">
                <Server className="mr-2" size={18} />
                Topics
              </h3>
              <p className="text-sm mt-1">Persistent message channels with multi-tenant support</p>
            </div>
            <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="font-semibold flex items-center">
                <Users className="mr-2" size={18} />
                Consumers
              </h3>
              <p className="text-sm mt-1">Process messages with different subscription types</p>
            </div>
          </div>
        </div>

        {/* Message Flow Visualization */}
        <div className={`mb-8 p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="mr-2" size={24} />
            Message Flow
          </h2>
          <MessageFlow 
            producedCount={stats.produced_count}
            consumedCounts={stats.consumed_count}
            darkMode={darkMode}
          />
        </div>

        {/* Controls and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Message Producer */}
          <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <MessageSquare className="mr-2" size={24} />
              Message Producer
            </h2>
            <MessageProducer onSendMessage={handleSendMessage} darkMode={darkMode} />
          </div>

          {/* Stats Panel */}
          <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="mr-2" size={24} />
              Message Statistics
            </h2>
            <StatsPanel stats={stats} darkMode={darkMode} />
          </div>

          {/* Latest Messages */}
          <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Clock className="mr-2" size={24} />
              Latest Messages
            </h2>
            <MessagesPanel 
              producedMessages={producedMessages.slice(-5)} 
              darkMode={darkMode} 
            />
          </div>
        </div>

        {/* Consumer Groups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ConsumerGroup 
            title="Consumer Group 1" 
            description="Shared subscription - all instances receive a subset of messages"
            messages={consumedMessages.group1} 
            groupId="group1"
            consumedCount={stats.consumed_count.group1}
            darkMode={darkMode}
          />
          <ConsumerGroup 
            title="Consumer Group 2" 
            description="Exclusive subscription - only one consumer receives all messages"
            messages={consumedMessages.group2} 
            groupId="group2"
            consumedCount={stats.consumed_count.group2}
            darkMode={darkMode}
          />
          <ConsumerGroup 
            title="Consumer Group 3" 
            description="Filtered subscription - only receives temperature & humidity data"
            messages={consumedMessages.group3} 
            groupId="group3"
            consumedCount={stats.consumed_count.group3}
            darkMode={darkMode}
          />
        </div>
      </main>

      <footer className={`mt-12 py-6 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-sm">
            Apache Pulsar Demo - Showcasing real-time messaging capabilities
          </p>
          <p className="text-xs mt-2 opacity-70">
            This is a demonstration application. In a production environment, you would connect to a real Apache Pulsar cluster.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;