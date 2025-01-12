import { useState } from 'preact/hooks';
import NMEADetailView from './NMEADetailView';
import { CopyToClipboard } from './CopyToClipboard';
import { ChevronDown, ChevronRight } from './ChevronIcons';
import { DropdownMenu, MenuItem } from './DropdownMenu';
import type { ProcessedData } from './nmea-types';

interface NMEADisplayProps {
  serialData: string;
  processedData: ProcessedData;
  onConnect: () => void;
  onDisconnect: () => void;
  onFilterChange: (sentenceType: string, enabled: boolean) => void;
  isConnected: boolean;
  isSupported: boolean;
}

const initialFilterItems: MenuItem[] = [
  {
    id: 'GGA',
    type: 'checkbox',
    label: 'GGA - Global Positioning Fix',
    checked: true
  },
  {
    id: 'GST',
    type: 'checkbox',
    label: 'GST - Position Error Statistics',
    checked: true
  },
  {
    id: 'GSA',
    type: 'checkbox',
    label: 'GSA - Active Satellites',
    checked: true
  },
  {
    id: 'GSV',
    type: 'label',
    label: 'GSV - Satellites in View',
    children: [
      {
        id: 'GSV_GP',
        type: 'checkbox',
        label: 'GPS',
        checked: true
      },
      {
        id: 'GSV_GL',
        type: 'checkbox',
        label: 'GLONASS',
        checked: true
      },
      {
        id: 'GSV_GB',
        type: 'checkbox',
        label: 'Galileo',
        checked: true
      },
      {
        id: 'GSV_BD',
        type: 'checkbox',
        label: 'BeiDou',
        checked: true
      }
    ]
  }
];

const NMEADisplay = ({ 
  serialData, 
  processedData,
  onConnect,
  onDisconnect,
  onFilterChange,
  isConnected,
  isSupported
}: NMEADisplayProps) => {
  const [isRawDataOpen, setIsRawDataOpen] = useState(false);
  const [isProcessedDataOpen, setIsProcessedDataOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(true);
  const [filterItems, setFilterItems] = useState<MenuItem[]>(initialFilterItems);

  const getProcessedData = () => JSON.stringify(processedData, null, 2);
  const getRawData = () => serialData;

  const updateFilterItem = (items: MenuItem[], itemId: string, checked: boolean): MenuItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, checked };
      }
      if (item.children) {
        return {
          ...item,
          children: updateFilterItem(item.children, itemId, checked)
        };
      }
      return item;
    });
  };

  const handleFilterChange = (itemId: string, checked: boolean) => {
    setFilterItems(prevItems => updateFilterItem(prevItems, itemId, checked));
    onFilterChange(itemId, checked);
  };

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-1">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">NMEA Data</h1>
        <span className={`${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
          {isSupported ? (isConnected ? 'Connected' : 'Not connected') : 'WebSerial is not supported'}
        </span>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onConnect}
            disabled={!isSupported || isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Connect
          </button>
          <button
            onClick={onDisconnect}
            disabled={!isSupported || !isConnected}
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
            Accumulated NMEA Data
          </button>
          <CopyToClipboard
            getData={getProcessedData}
            title="Copy processed data to clipboard"
          />
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
          <div className="flex items-center">
            <DropdownMenu
              items={filterItems}
              onChange={handleFilterChange}
              title="Filter"
              tooltip="Filter NMEA sentences"
              className="mr-2"
            />
            <CopyToClipboard
              getData={getRawData}
              title="Copy raw data to clipboard"
            />
          </div>
        </div>
        {isRawDataOpen && (
          <div className="p-2 border-t">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {serialData || <span className="text-gray-500">No data available</span>}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default NMEADisplay;