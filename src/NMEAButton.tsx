import { useState, useRef, useEffect } from 'preact/hooks';
import { useNMEA } from './useNMEA';
import { ConnectionFactory } from './ConnectionFactory';
import { ConnectionType } from './ConnectionInterface';

interface NMEAButtonProps {
  className?: string;
  detailsLabel: string, 
  detailsURL: string
}

export const NMEAButton = ({ 
  className = 'inline-flex items-center px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200',
  detailsLabel,
  detailsURL
}: NMEAButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { 
    processedData,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    connection
  } = useNMEA();

  const connectionTypes = ConnectionFactory.getConnectionTypes();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = async (type: ConnectionType) => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect(type as any);
    }
    setIsOpen(false);
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) {
      const accuracy = processedData?.errorStats ? 
        Math.sqrt(
          Math.pow(processedData.errorStats.latitudeError, 2) + 
          Math.pow(processedData.errorStats.longitudeError, 2)
        ) : null;

      if (!processedData?.position) return 'No Data';
      
      const fixType = processedData?.position?.fixType === 'Geo' ? 
        'Geo' : 
        `Fix: ${processedData?.position?.fixType}`;
        
      return accuracy !== null ? 
        `${fixType} ${accuracy.toFixed(2)}m` : 
        fixType;
    }
    return 'Connect';
  };

  const getButtonClass = () => {
    let baseClass = className;

    if (isConnecting) {
      return `${baseClass} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`;
    }

    if (!isConnected) {
      return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900`;
    }

    const hasData = processedData?.position !== null;
    if (!hasData) {
      return `${baseClass} bg-red-100 text-red-800 hover:bg-red-200`;
    }

    return `${baseClass} bg-green-100 text-green-800 hover:bg-green-200`;
  };

  return (
    <div class="relative" ref={menuRef}>
      <button 
        class={getButtonClass()}
        onClick={() => setIsOpen(!isOpen)}
        title={error || undefined}
      >
        {getStatusText()}
      </button>
      
      {isOpen && (
        <div class="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-50">
          {connectionTypes.map(type => 
            isConnected && type.id !== connection?.id ? null : (
            <button
              key={type.id}
              onClick={() => handleConnect(type)}
              disabled={!type.isSupported}
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white disabled:cursor-not-allowed"
            >
              {isConnected ? `Disconnect ${type.label}` : type.label}
            </button>
          ))}
          
          {detailsURL && (
            <>
              <div class="border-t my-2"></div>
              <a 
                href={detailsURL}
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {detailsLabel || 'View Details'}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
};
