import { useState } from 'preact/hooks';
import NMEADetailView from './NMEADetailView';
import { ClipboardIcon } from './ClipboardIcon';

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

  const handleCopyRawData = async () => {
    try {
      await navigator.clipboard.writeText(serialData);
    } catch (err) {
      console.error('Failed to copy raw data:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-1">
      <div className="flex justify-between items-center">
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
            Connect
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
          className="w-full p-2 text-left font-semibold flex items-center hover:bg-gray-50"
        >
          <span className="mr-2">
            {isDetailViewOpen ? <ChevronDown /> : <ChevronRight />}
          </span>
          NMEA Details
        </button>
        {isDetailViewOpen && (
          <div className="p-2 border-t">
            <NMEADetailView processedData={processedData} />
          </div>
        )}
      </div>

      <div className="border rounded-lg shadow-sm">
        <div className="p-2 flex items-center justify-between hover:bg-gray-50">
          <button 
            onClick={() => setIsProcessedDataOpen(!isProcessedDataOpen)}
            className="flex items-center flex-grow text-left font-semibold"
          >
            <span className="mr-2">
              {isProcessedDataOpen ? <ChevronDown /> : <ChevronRight />}
            </span>
            Processed NMEA Data
          </button>
          <button
            onClick={() => {
              try {
                navigator.clipboard.writeText(JSON.stringify(processedData, null, 2));
              } catch (err) {
                console.error('Failed to copy processed data:', err);
              }
            }}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy processed data to clipboard"
          >
            <ClipboardIcon size={18} />
          </button>
        </div>
        {isProcessedDataOpen && (
          <div className="p-2 border-t">
            <pre className="bg-blue-50 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(processedData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="border rounded-lg shadow-sm">
        <div className="p-2 flex items-center justify-between hover:bg-gray-50">
          <button 
            onClick={() => setIsRawDataOpen(!isRawDataOpen)}
            className="flex items-center flex-grow text-left font-semibold"
          >
            <span className="mr-2">
              {isRawDataOpen ? <ChevronDown /> : <ChevronRight />}
            </span>
            Raw Serial Data
          </button>
          <button
            onClick={handleCopyRawData}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy raw data to clipboard"
          >
            <ClipboardIcon size={18} />
          </button>
        </div>
        {isRawDataOpen && (
          <div className="p-2 border-t">
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
