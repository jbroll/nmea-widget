import { render } from 'preact';
import { NMEAAccumulator } from './NMEAAccumulator';
import { SerialConnection } from './SerialConnection';
import './globals.css';
import NMEADisplay from './NMEADisplay';

let serialConnection = new SerialConnection();
let accumulator = new NMEAAccumulator();
let serialData = '';
let processedData = {};

async function connectSerial() {
  try {
    serialConnection.onDebug((message) => {
      console.log('Serial Debug:', message);
    });

    serialConnection.onError((error) => {
      console.error('Serial Error:', error);
    });

    serialConnection.onMessage((data: string) => {
      serialData = data;  // Just store the latest data
      
      if (data.startsWith('$')) {
        try {
          accumulator.process(data);
          processedData = accumulator.getData();
        } catch (e) {
          console.error('Error processing NMEA sentence:', e);
        }
        updateUI();
      }
    });

    await serialConnection.connect();
  } catch (error) {
    console.error('Serial connection error:', error);
  }
}

async function disconnectSerial() {
  try {
    if (serialConnection.isConnected()) {
      await serialConnection.disconnect();
    }
  } catch (error) {
    console.error('Disconnect error:', error);
  } finally {
    updateUI();
  }
}

function updateUI() {
  render(
    <NMEADisplay
      serialData={serialData}
      processedData={processedData}
      onConnect={connectSerial}
      onDisconnect={disconnectSerial}
      isConnected={serialConnection.isConnected()}
    />,
    document.getElementById('app')!
  );
}

// Initial render
updateUI();

// Export for debugging
(window as any).accumulator = accumulator;
(window as any).serialConnection = serialConnection;