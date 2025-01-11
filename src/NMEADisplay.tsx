import { useState } from 'preact/hooks';
import NMEADetailView from './NMEADetailView';

// Icon components
const ChevronDown = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const ChevronRight = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

interface NMEADisplayProps {
  serialData: string;
  processedData: any;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnected: boolean;
}

const NMEADisplay = ({ 
  serialData, 
  processedData,
  onConnect,
  onDisconnect,
  isConnected 
}: NMEADisplayProps) => {
  const [isRawDataOpen, setIsRawDataOpen] = useState(false);
  const [isProcessedDataOpen, setIsProcessedDataOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(true);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">NMEA Data</h1>
          <span className={`${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
            {isConnected ? 'Connected' : 'Not connected'}
          </span>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onConnect}
            disabled={isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Connect Serial Port
          </button>
          <button
            onClick={onDisconnect}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm">
        <button 
          onClick={() => setIsDetailViewOpen(!isDetailViewOpen)}
          className="w-full p-4 text-left font-semibold flex items-center hover:bg-gray-50"
        >
          <span className="mr-2">
            {isDetailViewOpen ? <ChevronDown /> : <ChevronRight />}
          </span>
          NMEA Details
        </button>
        {isDetailViewOpen && (
          <div className="p-4 border-t">
            <NMEADetailView processedData={processedData} />
          </div>
        )}
      </div>

      <div className="border rounded-lg shadow-sm">
        <button 
          onClick={() => setIsProcessedDataOpen(!isProcessedDataOpen)}
          className="w-full p-4 text-left font-semibold flex items-center hover:bg-gray-50"
        >
          <span className="mr-2">
            {isProcessedDataOpen ? <ChevronDown /> : <ChevronRight />}
          </span>
          Processed NMEA Data
        </button>
        {isProcessedDataOpen && (
          <div className="p-4 border-t">
            <pre className="bg-blue-50 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(processedData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="border rounded-lg shadow-sm">
        <button 
          onClick={() => setIsRawDataOpen(!isRawDataOpen)}
          className="w-full p-4 text-left font-semibold flex items-center hover:bg-gray-50"
        >
          <span className="mr-2">
            {isRawDataOpen ? <ChevronDown /> : <ChevronRight />}
          </span>
          Raw Serial Data
        </button>
        {isRawDataOpen && (
          <div className="p-4 border-t">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {serialData}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default NMEADisplay;