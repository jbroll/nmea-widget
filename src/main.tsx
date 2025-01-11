import { render } from 'preact';
import './globals.css';
import NMEADisplay from './NMEADisplay';
import { useNMEA } from './useNMEA';

function App() {
  const { 
    serialData,
    processedData,
    isConnected,
    connect,
    disconnect
  } = useNMEA();

  return (
    <NMEADisplay
      serialData={serialData}
      processedData={processedData}
      onConnect={connect}
      onDisconnect={disconnect}
      isConnected={isConnected}
    />
  );
}

// Initial render
render(<App />, document.getElementById('app')!);