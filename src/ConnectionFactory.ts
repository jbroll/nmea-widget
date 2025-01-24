import { ConnectionInterface, ConnectionType, ConnectionConstructor } from './ConnectionInterface';
import { SerialConnection } from './SerialConnection';
import { BluetoothConnection } from './BluetoothConnection';
import { GeoLocationConnection } from './GeoLocationConnection';

export class ConnectionFactory {
  private static connections = new Map<ConnectionType, ConnectionConstructor>([
    ['serial', SerialConnection as ConnectionConstructor],
    ['bluetooth', BluetoothConnection as ConnectionConstructor],
    ['geolocation', GeoLocationConnection as ConnectionConstructor]
  ]);

  static createConnection(type: ConnectionType): ConnectionInterface {
    const Connection = this.connections.get(type);
    if (!Connection) {
      throw new Error(`Unknown connection type: ${type}`);
    }
    return new Connection();
  }

  static getSupportedTypes(): ConnectionType[] {
    return Array.from(this.connections.entries())
      .filter(([_, Connection]) => Connection.support.isSupported())
      .map(([type]) => type);
  }
}