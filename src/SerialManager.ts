
export class SerialManager {
  private port: SerialPort | null = null;
  private isConnected = false;

  async connect(onData: (data: string) => void): Promise<void> {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });

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

      if (!this.port.readable) {
        throw new Error('Readable stream is undefined');
      }

      this.port.readable
        .pipeThrough(decoder)
        .pipeThrough(lineBreakTransformer)
        .pipeTo(new WritableStream({
          write: (line) => {
            if (this.isConnected) {  // Only process data if still connected
              onData(line);
            }
          }
        }));

      this.isConnected = true;
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      console.log("Starting aggressive disconnect...");
      
      // Mark as disconnected first to stop processing new data
      this.isConnected = false;

      if (this.port) {
        // Force forget the port - this should release all locks
        try {
          await this.port.forget();
        } catch (e) {
          console.log("Forget failed, continuing with closure", e);
        }

        // Try to force close readable/writable streams if they exist
        if (this.port.readable) {
          try {
            await this.port.readable.cancel();
          } catch (e) {
            console.log("Readable cancel failed, continuing", e);
          }
        }
        
        if (this.port.writable) {
          try {
            await this.port.writable.abort();
          } catch (e) {
            console.log("Writable abort failed, continuing", e);
          }
        }

        // Finally try to close the port
        try {
          await this.port.close();
        } catch (e) {
          console.log("Close failed, but port should be released", e);
        }

        this.port = null;
      }

      console.log("Disconnect complete");
    } catch (error) {
      console.error('Error during disconnect:', error);
      // Even if we hit an error, we want to make sure we're marked as disconnected
      this.isConnected = false;
      throw error;
    }
  }

  isPortConnected(): boolean {
    return this.isConnected;
  }
}