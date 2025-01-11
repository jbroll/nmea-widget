export class SerialConnection {
  private port: SerialPort | null = null;
  private messageCallback: ((data: string) => void) | null = null;
  private debugCallback: ((message: string) => void) | null = null;
  private errorCallback: ((error: Error) => void) | null = null;
  private isReading: boolean = false;
  private lastError: number = 0;
  private errorCount: number = 0;

  // Constants
  private static ERROR_THRESHOLD = 10;  // Max errors before notification
  private static ERROR_RESET_TIME = 60000;  // Time to reset error count (1 minute)
  private static BAUD_RATE = 115200;

  public static isSupported(): boolean {
    return 'serial' in navigator;
  }

  public onDebug(callback: (message: string) => void) {
    this.debugCallback = callback;
  }

  public onError(callback: (error: Error) => void) {
    this.errorCallback = callback;
  }

  private debug(message: string) {
    if (this.debugCallback) {
      this.debugCallback(message);
    }
  }

  private handleError(error: Error) {
    const now = Date.now();
    this.errorCount++;

    if (now - this.lastError > SerialConnection.ERROR_RESET_TIME) {
      this.errorCount = 1;
    }

    this.lastError = now;
    this.debug(`Error: ${error.message}`);

    if (this.errorCount >= SerialConnection.ERROR_THRESHOLD && this.errorCallback) {
      this.errorCallback(new Error(`Multiple errors occurred: ${error.message}`));
    }
  }

  public async connect(): Promise<SerialPort> {
    if (!SerialConnection.isSupported()) {
      throw new Error('Web Serial is not supported in this browser.');
    }

    if (this.isConnected()) {
      throw new Error('Already connected');
    }

    try {
      this.debug('Requesting serial port...');
      
      this.port = await navigator.serial.requestPort();

      this.debug('Port selected. Opening connection...');

      await this.port.open({
        baudRate: SerialConnection.BAUD_RATE,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      this.debug('Serial connection opened');

      // Reset error tracking on new connection
      this.errorCount = 0;
      this.lastError = 0;

      if (!this.port.readable) {
        throw new Error('Port readable stream is undefined');
      }

      // Set up the streaming pipeline
      const decoder = new TextDecoderStream();
      let buffer = '';

      const lineBreakTransformer = new TransformStream({
        transform(chunk, controller) {
          buffer += chunk;
          const lines = buffer.split('\r\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 0) {
              controller.enqueue(trimmed);
            }
          }
        },
        flush(controller) {
          if (buffer.length > 0) {
            const trimmed = buffer.trim();
            if (trimmed.length > 0) {
              controller.enqueue(trimmed);
            }
          }
        }
      });

      this.isReading = true;
      
      this.port.readable
        .pipeThrough(decoder)
        .pipeThrough(lineBreakTransformer)
        .pipeTo(new WritableStream({
          write: (line: string) => {
            if (this.isReading && this.messageCallback) {
              this.debug(`Received data: ${line}`);
              this.messageCallback(line);
            }
          },
          abort: (reason) => {
            this.handleError(new Error(`Stream aborted: ${reason}`));
          }
        }))
        .catch(error => {
          this.handleError(error instanceof Error ? error : new Error('Stream error'));
        });

      return this.port;

    } catch (error) {
      const errorMessage = error instanceof Error ?
        `${error.name}: ${error.message}` :
        'Unknown error occurred';
      this.debug(`Connection failed: ${errorMessage}`);
      
      // Clean up any partial connection
      await this.cleanup();
      
      throw error;
    }
  }

  public onMessage(callback: (data: string) => void) {
    this.messageCallback = callback;
  }

  private async cleanup() {
    this.isReading = false;

    if (this.port) {
      // First try to cancel any ongoing reads
      if (this.port.readable) {
        try {
          await this.port.readable.cancel();
        } catch (e) {
          this.debug(`Readable cancel failed: ${e}`);
        }
      }
      
      // Then try to abort any writes
      if (this.port.writable) {
        try {
          await this.port.writable.abort();
        } catch (e) {
          this.debug(`Writable abort failed: ${e}`);
        }
      }

      // Try to force forget the port
      try {
        await this.port.forget();
      } catch (e) {
        this.debug(`Port forget failed: ${e}`);
      }

      // Finally try to close the port
      try {
        await this.port.close();
      } catch (e) {
        this.debug(`Port close failed: ${e}`);
      }

      this.port = null;
    }
  }

  public async disconnect() {
    this.debug('Starting aggressive disconnect...');
    this.isReading = false;
    await this.cleanup();
    this.debug('Disconnected from device');
  }

  public async sendCommand(command: string) {
    if (!this.port?.writable) {
      throw new Error('Not connected');
    }

    try {
      const encoder = new TextEncoder();
      const writer = this.port.writable.getWriter();
      await writer.write(encoder.encode(command + '\r\n'));
      writer.releaseLock();
      this.debug(`Sent command: ${command}`);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Write error'));
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.port !== null && this.isReading;
  }
}