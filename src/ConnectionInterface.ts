export interface ConnectionSupport {
  isSupported(): boolean;
}

export interface ConnectionInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  onMessage(callback: (data: string) => void): void;
  sendCommand(command: string): Promise<void>;
}

export interface ConnectionConstructor {
  new(): ConnectionInterface;
  support: ConnectionSupport;
}

export type ConnectionType = 'serial' | 'bluetooth' | 'geolocation';

export interface ConnectionOptions {
  type: ConnectionType;
}