# NMEA Widgets

A modern web application for visualizing NMEA GPS data in real-time using Web Serial API. Built with Preact, TypeScript, and Tailwind CSS.

## Features

- Real-time NMEA sentence parsing and visualization
- Interactive satellite constellation view showing:
  - GPS, GLONASS, Galileo, and BeiDou satellites
  - Signal strength indicators
  - Elevation and azimuth display
  - Satellite status (in use/visible)
- Position information display with:
  - Latitude/Longitude
  - Altitude
  - Position accuracy (when GST messages available)
  - Fix type and satellite count
- Raw NMEA data view
- Processed data inspection panel
- Responsive design that works on desktop and mobile browsers

## Requirements

- Modern web browser with Web Serial API support (Chrome, Edge, Opera)
- NMEA-compatible GPS device (tested with u-blox receivers)
- Node.js 18+ and npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nmea-widgets.git
cd nmea-widgets
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Or use make:
```bash
make build
```

The application will be available at `http://localhost:3000`

## Usage

1. Connect your GPS device to your computer via USB, BlueTooth or system serial port.
2. Click the "Connect Serial Port" button in the application
3. Select your GPS device from the port selection dialog
4. The application will begin displaying real-time GPS data

## Supported NMEA Messages

The application currently supports parsing these NMEA sentence types:
- GGA (Global Positioning System Fix Data)
- GSA (GNSS DOP and Active Satellites)
- GSV (GNSS Satellites in View)
- GST (GNSS Pseudorange Error Statistics)

## Development

The project uses:
- Preact for UI components
- TypeScript for type safety
- Tailwind CSS for styling
- Vite for building and development
- Web Serial API for device communication

Key source files:
- `src/NMEAAccumulator.ts` - NMEA sentence parsing and state management
- `src/SerialConnection.ts` - Web Serial API communication
- `src/SatellitePlot.tsx` - Satellite visualization component
- `src/NMEAInfo.tsx` - Position information display
- `src/useNMEA.ts` - React hook for NMEA data management

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built using 
  [nmea-simple](https://github.com/jbroll/nmea-simple) a fork of 
  [nmea-simple](https://github.com/101100/nmea-simple) 
  for NMEA sentence parsing
- Interface design inspired by modern GPS visualization tools
