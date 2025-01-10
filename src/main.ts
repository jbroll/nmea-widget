// src/main.ts
import { NMEAAccumulator } from './NMEAAccumulator';
import { SerialManager } from './SerialManager';

let serialManager = new SerialManager(); // Initialize immediately
let accumulator = new NMEAAccumulator(); // Initialize immediately

// UI Elements
const connectButton = document.getElementById('connect') as HTMLButtonElement;
const disconnectButton = document.getElementById('disconnect') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;
const serialDataDiv = document.getElementById('serialData') as HTMLDivElement;
const processedDataDiv = document.getElementById('processedData') as HTMLDivElement;

function updateUIState(isConnected: boolean) {
  connectButton.disabled = isConnected;
  disconnectButton.disabled = !isConnected;
  statusDiv.textContent = isConnected ? 'Connected' : 'Not connected';
  statusDiv.style.color = isConnected ? 'green' : 'black';
}

function appendSerialData(data: string) {
  const maxLines = 100;
  const lines = serialDataDiv.textContent?.split('\n') || [];
  lines.push(data);
  if (lines.length > maxLines) {
    lines.shift();
  }
  serialDataDiv.textContent = lines.join('\n');
}

async function connectSerial() {
  try {
    await serialManager.connect((data: string) => {
      appendSerialData(data);
      
      if (data.startsWith('$')) {
        try {
          accumulator.process(data);
          const processedData = accumulator.getData();
          processedDataDiv.textContent = JSON.stringify(processedData, null, 2);
        } catch (e) {
          console.error('Error processing NMEA sentence:', e);
        }
      }
    });

    updateUIState(true);
  } catch (error) {
    console.error('Serial connection error:', error);
    statusDiv.textContent = `Connection failed: ${error}`;
    statusDiv.style.color = 'red';
  }
}

async function disconnectSerial() {
  try {
    console.log("Click!");
    if (serialManager.isPortConnected()) {
    console.log("SM Dis!");
      await serialManager.disconnect();
      updateUIState(false);
    }
  } catch (error) {
    console.error('Disconnect error:', error);
    statusDiv.textContent = `Disconnect failed: ${error}`;
    statusDiv.style.color = 'red';
  }
}

// Event listeners
connectButton.addEventListener('click', connectSerial);
disconnectButton.addEventListener('click', disconnectSerial);

// Initial UI state
updateUIState(false);

// Export for debugging
(window as any).accumulator = accumulator;
(window as any).serialManager = serialManager;
