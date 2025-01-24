import { useState } from 'preact/hooks';
import { ConnectionType } from './ConnectionInterface';

interface ConnectionControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: (type: ConnectionType) => void;
  onDisconnect: () => void;
  supportedTypes: ConnectionType[];
}

const CONNECTION_LABELS: Record<ConnectionType, string> = {
  serial: 'Serial Port',
  bluetooth: 'Bluetooth',
  geolocation: 'Browser Location'
};

export const ConnectionControls = ({ 
  isConnected, 
  isConnecting,
  onConnect,
  onDisconnect,
  supportedTypes
}: ConnectionControlsProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleConnect = () => {
    if (isConnected) {
      onDisconnect();
      return;
    }

    if (supportedTypes.length === 1) {
      onConnect(supportedTypes[0]);
    } else {
      setShowOptions(true);
    }
  };

  return (
    <div class="relative">
      <div class="flex items-center space-x-2">
        <button
          onClick={handleConnect}
          disabled={supportedTypes.length === 0 || isConnecting}
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
        
        <span class={`${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
          {supportedTypes.length === 0 ? 
            'No connection methods available' : 
            (isConnected ? 'Connected' : 'Not connected')}
        </span>
      </div>

      {showOptions && !isConnected && (
        <div class="absolute top-12 left-0 w-48 bg-white rounded-md shadow-lg z-10 p-2">
          {supportedTypes.map(type => (
            <button
              key={type}
              onClick={() => {
                onConnect(type);
                setShowOptions(false);
              }}
              class="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
            >
              {CONNECTION_LABELS[type]}
            </button>
          ))}
        </div>
      )}
      
      {showOptions && (
        <div 
          class="fixed inset-0 z-0" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};