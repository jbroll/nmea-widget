import { render } from 'preact';
import './globals.css';
import { NMEADisplay, useNMEA } from '@jbroll/nmea-widgets';

function App() {
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
    <NMEADisplay
      serialData={serialData}
      processedData={processedData}
      onConnect={connect}
      onDisconnect={disconnect}
      onFilterChange={setFilter}
      isConnected={isConnected}
      isSupported={isSupported}
    />
  );
}

// Initial render
render(<App />, document.getElementById('app')!);
