import { useNMEA } from './useNMEA';
import { NMEADataCard } from './NMEADataCard';
import { NMEAAccumulatorCard } from './NMEAAccumulatorCard';
import { NMEARawSerialCard } from './NMEARawSerialCard';

export const NMEADisplay = () => {
  const { 
    serialData, 
    processedData,
    isConnected,
    connect,
    disconnect,
    setFilter,
    isSupported
  } = useNMEA();

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-1">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">NMEA Data</h1>
        <span className={`${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
          {isSupported ? (isConnected ? 'Connected' : 'Not connected') : 'WebSerial is not supported'}
        </span>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={connect}
            disabled={!isSupported || isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            disabled={!isSupported || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Disconnect
          </button>
        </div>
      </div>

      <NMEADataCard processedData={processedData} />
      
      <NMEAAccumulatorCard processedData={processedData} />
      
      <NMEARawSerialCard 
        serialData={serialData}
        onFilterChange={setFilter}
      />
    </div>
  );
};

