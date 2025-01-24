import { ConnectionInterface, ConnectionType } from './ConnectionInterface';
import { SerialConnection } from './SerialConnection';
import { BluetoothConnection } from './BluetoothConnection';
import { GeoLocationConnection } from './GeoLocationConnection';

export class ConnectionFactory {
  private static connectionTypes: ConnectionType[] = [
    {
      id: SerialConnection.Id,
      label: 'Serial Port',
      constructor: SerialConnection,
      isSupported: SerialConnection.supported
    },
    {
      id: BluetoothConnection.Id,
      label: 'Bluetooth',
      constructor: BluetoothConnection,
      isSupported: BluetoothConnection.supported
    },
    {
      id: GeoLocationConnection.Id,
      label: 'Browser Location',
      constructor: GeoLocationConnection,
      isSupported: GeoLocationConnection.supported
    }
  ];

  static createConnection(type: ConnectionType): ConnectionInterface {
    if (!type.isSupported) {  
      throw new Error(`Connection type not supported: ${type}`);
    }

    return new type.constructor();
  }

  static getConnectionTypes(): ConnectionType[] {
    return this.connectionTypes;
  }
}
