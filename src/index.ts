// Main components
export { NMEADisplay } from './NMEADisplay';
export { NMEADetailView } from './NMEADetailView';
export { SatellitePlot } from './SatellitePlot';
export { NMEAInfo } from './NMEAInfo';

// Core functionality
export { SerialConnection } from './SerialConnection';
export { BluetoothConnection } from './BluetoothConnection';
export { NMEAAccumulator } from './NMEAAccumulator';
export { useNMEA } from './useNMEA';

// Connection types
export type { ConnectionInterface, ConnectionType, ConnectionOptions, ConnectionSupport } from './ConnectionInterface';

// Utility components
export { CopyToClipboard } from './CopyToClipboard';
export { DropdownMenu } from './DropdownMenu';
export type { MenuItem } from './DropdownMenu';

// Types
export type * from './nmea-types';