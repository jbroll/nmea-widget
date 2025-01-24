import { useState } from 'preact/hooks';
import { ConnectionType } from './ConnectionInterface';

interface ConnectionControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: (type: ConnectionType) => void;
  onDisconnect: () => void;
  serialSupported: boolean;
  bluetoothSupported: boolean;
}

export const ConnectionControls = ({ 
  isConnected, 
  isConnecting,
  onConnect,
  onDisconnect,
  serialSupported,
  bluetoothSupported
}: ConnectionControlsProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleConnect = () => {
    if (isConnected) {
      onDisconnect();
      return;
    }

    // If only one connection type is supported, use it directly
    if (serialSupported && !bluetoothSupported) {
      onConnect('serial');
    } else if (bluetoothSupported && !serialSupported) {
      onConnect('bluetooth');
    } else {
      setShowOptions(true);
    }
  };

  return (
    <div class="relative">
      <div class="flex items-center space-x-2">
        <button
          onClick={handleConnect}
          disabled={!serialSupported && !bluetoothSupported || isConnecting}
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
        
        <span class={`${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
          {!serialSupported && !bluetoothSupported ? 
            'No connection methods available' : 
            (isConnected ? 'Connected' : 'Not connected')}
        </span>
      </div>

      {showOptions && !isConnected && (
        <div class="absolute top-12 left-0 w-48 bg-white rounded-md shadow-lg z-10 p-2">
          {serialSupported && (
            <button
              onClick={() => {
                onConnect('serial');
                setShowOptions(false);
              }}
              class="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
            >
              Serial Port
            </button>
          )}
          {bluetoothSupported && (
            <button
              onClick={() => {
                onConnect('bluetooth');
                setShowOptions(false);
              }}
              class="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
            >
              Bluetooth
            </button>
          )}
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