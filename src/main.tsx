import { render } from 'preact';
import { NMEAAccumulator } from './NMEAAccumulator';
import { SerialManager } from './SerialManager';
import './globals.css';
import NMEADisplay from './NMEADisplay';

let serialManager = new SerialManager();
let accumulator = new NMEAAccumulator();
let serialData = '';
let processedData = {};

function updateSerialData(data: string) {
  const maxLines = 100;
  const lines = serialData.split('\n');
  lines.push(data);
  if (lines.length > maxLines) {
    lines.shift();
  }
  serialData = lines.join('\n');
  updateUI();
}

async function connectSerial() {
  try {
    await serialManager.connect((data: string) => {
      updateSerialData(data);
      
      if (data.startsWith('$')) {
        try {
          accumulator.process(data);
          processedData = accumulator.getData();
        } catch (e) {
          console.error('Error processing NMEA sentence:', e);
        } finally {
          updateUI();
        }
      }
    });
  } catch (error) {
    console.error('Serial connection error:', error);
  }
}

async function disconnectSerial() {
  try {
    if (serialManager.isPortConnected()) {
      await serialManager.disconnect();
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
      isConnected={serialManager.isPortConnected()}
    />,
    document.getElementById('app')!
  );
}

// Initial render
updateUI();

// Export for debugging
(window as any).accumulator = accumulator;
(window as any).serialManager = serialManager;
