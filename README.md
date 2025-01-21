# NMEA Widgets

<img align="right" src="images/NMEADisplay.png" alt="NMEA Data Display" width="400">

A modern React/Preact component library for visualizing NMEA GPS data in real-time using the Web Serial API. Built with TypeScript and Tailwind CSS.

[Try the nmea-demo!](https://jbroll.github.io/nmea-widgets/)

<br clear="all">

## Features

- Real-time NMEA sentence parsing and visualization
- Interactive satellite constellation view showing:
  - GPS, GLONASS, Galileo, and BeiDou satellites
  - Color-coded signal strength indicators (SNR)
  - Elevation and azimuth display
  - Satellite status (in use/visible)
  - Interactive tooltips with detailed satellite info
  - Constellation filtering options
  - Visibility filtering (all/in-use)
- Position information display with:
  - Latitude/Longitude coordinates with copy functionality
  - Altitude in meters
  - Position accuracy (when GST messages available)
  - Fix type and active satellite count
  - Error statistics
- Raw NMEA data view with:
  - Message type filtering
  - Constellation-specific GSV filtering
  - Collapsible interface
  - Copy functionality
- Processed data inspection panel
- Responsive design that works on desktop and mobile browsers

## Installation

```bash
npm install @jbroll/nmea-widgets
```

This package has peer dependencies that you'll need to install in your project:

```bash
npm install preact tailwindcss
```

## Setup

1. Configure Tailwind CSS in your project. Add the NMEA Widgets content paths to your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@jbroll/nmea-widgets/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

2. Import and initialize Tailwind CSS in your application:

```css
/* styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Basic Usage

```tsx
import { NMEADisplay } from '@jbroll/nmea-widgets';

function App() {
  return <NMEADisplay />;
}
```

For more control over the NMEA processing, you can use the `useNMEA` hook:

```tsx
import { useNMEA, NMEADetailView } from '@jbroll/nmea-widgets';

function CustomDisplay() {
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
    <div>
      <button onClick={connect} disabled={!isSupported || isConnected}>
        Connect
      </button>
      <NMEADetailView processedData={processedData} />
    </div>
  );
}
```

## Components

### NMEADisplay

The main component that provides a complete UI for NMEA data visualization. Automatically manages serial connection and data processing.

```tsx
<NMEADisplay />
```

### SatellitePlot

A standalone component for visualizing satellite positions and signal strengths.

```tsx
import { SatellitePlot } from '@jbroll/nmea-widgets';

<SatellitePlot data={processedData} />
```

Features:
- Interactive polar plot showing satellite positions
- Color-coded signal strength indicators
- Constellation filtering (GPS, GLONASS, Galileo, BeiDou)
- Visibility filtering (all satellites vs in-use only)
- Hover tooltips with detailed satellite information
- Elevation rings and azimuth markers
- Signal strength and constellation legends

### NMEAInfo

Displays position information and accuracy metrics.

```tsx
import { NMEAInfo } from '@jbroll/nmea-widgets';

<NMEAInfo data={processedData} />
```

Features:
- Current position display (latitude, longitude)
- Altitude information
- Position accuracy (when available)
- Fix type indicator
- Active satellite count
- Copy coordinates functionality

### useNMEA Hook

A React hook that handles Web Serial communication and NMEA data processing.

```tsx
const {
  serialData,        // Raw NMEA sentences
  processedData,     // Parsed and processed NMEA data
  isConnected,       // Connection state
  isConnecting,      // Connection in progress
  error,             // Error state
  connect,           // Function to initiate connection
  disconnect,        // Function to close connection
  sendCommand,       // Function to send commands to device
  setFilter,         // Function to filter NMEA sentences
  isSupported        // Whether Web Serial API is supported
} = useNMEA();
```

## Types

### ProcessedData

```typescript
interface ProcessedData {
  position: {
    latitude: number;
    longitude: number;
    altitudeMeters: number;
    fixType: number;
    satellites: number;
  } | null;
  errorStats: {
    latitudeError: number;
    longitudeError: number;
    altitudeError: number;
  } | null;
  satellites: {
    visible: Satellite[];
    inUse: number[];
  };
}

interface Satellite {
  prnNumber: number;
  elevationDegrees: number;
  azimuthTrue: number;
  SNRdB: number;
  constellation: string;
}
```

### Supported NMEA Messages

The library currently supports parsing these NMEA sentence types:
- GGA (Global Positioning System Fix Data)
- GSA (GNSS DOP and Active Satellites)
- GSV (GNSS Satellites in View)
- GST (GNSS Pseudorange Error Statistics)

Supported constellations:
- GPS (GP)
- GLONASS (GL)
- Galileo (GA)
- BeiDou (GB)

## Browser Support

The Web Serial API is required for this library to function. Currently supported in:
- Google Chrome (desktop) version 89+
- Microsoft Edge (desktop) version 89+
- Opera (desktop) version 75+
- Chrome for Android (with flag enabled)

## Development

To build the library:

```bash
npm install
npm run build
```

To run the demo application:

```bash
cd examples/nmea-demo
npm install
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

The project uses:
- Preact for UI components
- TypeScript for type safety
- Tailwind CSS for styling
- Vite for building and development
- Web Serial API for device communication
- nmea-simple for NMEA sentence parsing

## License

MIT License - see LICENSE file for details