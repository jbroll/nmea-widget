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
    disconnect,
    isSupported
  } = useNMEA();

  return (
    <NMEADisplay
      serialData={serialData}
      processedData={processedData}
      onConnect={connect}
      onDisconnect={disconnect}
      isConnected={isConnected}
      isSupported={isSupported}
    />
  );
}

// Initial render
render(<App />, document.getElementById('app')!);