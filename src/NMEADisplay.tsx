import { useNMEA } from './useNMEA';
import { NMEADataCard } from './NMEADataCard';
import { NMEAAccumulatorCard } from './NMEAAccumulatorCard';
import { NMEARawSerialCard } from './NMEARawSerialCard';
import { NMEAButton } from './NMEAButton';

export interface NMEADisplayProps {
  onDetailsClick?: () => void;
}

export const NMEADisplay = ({ onDetailsClick }: NMEADisplayProps) => {
  const { 
    serialData, 
    processedData,
    setFilter,
  } = useNMEA();

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-1">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">NMEA Data</h1>
        
        <NMEAButton 
          detailsLabel={onDetailsClick ? 'NMEA Data' : undefined}
          onDetailsClick={onDetailsClick}
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