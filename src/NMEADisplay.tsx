import { useNMEA } from './useNMEA';
import { NMEADataCard } from './NMEADataCard';
import { NMEAAccumulatorCard } from './NMEAAccumulatorCard';
import { NMEARawSerialCard } from './NMEARawSerialCard';
import { ConnectionControls } from './ConnectionControls';

export const NMEADisplay = () => {
  const { 
    serialData, 
    processedData,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    setFilter,
    supportedTypes
  } = useNMEA();

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-1">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">NMEA Data</h1>
        
        <ConnectionControls 
          isConnected={isConnected}
          isConnecting={isConnecting}
          onConnect={connect}
          onDisconnect={disconnect}
          supportedTypes={supportedTypes}
        />
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