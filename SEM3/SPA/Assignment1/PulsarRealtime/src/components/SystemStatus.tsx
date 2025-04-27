import React from 'react';
import { CheckCircle as CircleCheck, AlertCircle as CircleAlert } from 'lucide-react';

interface SystemStatusProps {
  connected: boolean;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ connected }) => {
  return (
    <div className="flex items-center space-x-2">
      {connected ? (
        <>
          <CircleCheck size={18} className="text-green-400" />
          <span className="text-sm font-medium">Connected</span>
        </>
      ) : (
        <>
          <CircleAlert size={18} className="text-red-400" />
          <span className="text-sm font-medium">Disconnected</span>
        </>
      )}
    </div>
  );
};

export default SystemStatus;