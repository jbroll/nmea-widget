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

export type ConnectionType = 'serial' | 'bluetooth';

export interface ConnectionOptions {
  type: ConnectionType;
}