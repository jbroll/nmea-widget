import { 
  GSVPacket,
  GSAPacket,
  GGAPacket,
  GSTPacket,
  parseNmeaSentence,
} from 'nmea-simple';

interface Satellite extends GSVPacket['satellites'][0] {
  constellation: string;
}

interface SatelliteUseInfo {
  lastSeen: number;
}

export class NMEAAccumulator {
  private gsvMessages: GSVPacket[] = [];
  private position: GGAPacket | null = null;
  private errorStats: GSTPacket | null = null;
  private visibleSatellites = new Map<number, Satellite>();
  private satellitesInUse = new Map<number, SatelliteUseInfo>();
  private readonly STALE_THRESHOLD_MS = 5000;
  
  private getConstellation(satId: number): string {
    if (satId >= 1 && satId <= 32) return 'GP';
    if (satId >= 65 && satId <= 96) return 'GL';
    if (satId >= 201 && satId <= 236) return 'GB';
    if (satId >= 401 && satId <= 463) return 'BD';
    return 'GP';
  }

  process(sentence: string) {
    try {
      const parsed = parseNmeaSentence(sentence);
      
      switch(parsed.sentenceId) {
        case 'GSV': 
          this.handleGSV(parsed as GSVPacket);
          break;
        case 'GSA':
          this.handleGSA(parsed as GSAPacket);
          break;
        case 'GGA':
          this.position = parsed as GGAPacket;
          break;
        case 'GST':
          this.errorStats = parsed as GSTPacket;
          break;
      }
    } catch (error) {
      console.error('Error processing NMEA sentence:', error);
    }
  }

  private handleGSV(gsv: GSVPacket) {
    try {
      // Update or add the message in the collection
      const existingIndex = this.gsvMessages.findIndex(
        msg => msg.messageNumber === gsv.messageNumber && msg.talkerId === gsv.talkerId
      );
      
      if (existingIndex !== -1) {
        this.gsvMessages[existingIndex] = gsv;
      } else {
        this.gsvMessages.push(gsv);
      }

      // Check if we have all messages for this constellation
      const constellationMessages = this.gsvMessages.filter(msg => msg.talkerId === gsv.talkerId);
      const isComplete = constellationMessages.length === gsv.numberOfMessages;
      const messageNumbers = new Set(constellationMessages.map(msg => msg.messageNumber));
      const hasAllMessageNumbers = messageNumbers.size === gsv.numberOfMessages;
      
      if (isComplete && hasAllMessageNumbers) {
        // Clear existing satellites for this constellation
        this.visibleSatellites.forEach((sat, id) => {
          if (sat.constellation === gsv.talkerId) {
            this.visibleSatellites.delete(id);
          }
        });
        
        // Process all satellites from the complete set
        constellationMessages.forEach(msg => {
          if (msg.satellites) {
            msg.satellites.forEach(sat => {
              if (sat && sat.prnNumber && sat.prnNumber > 0) {
                this.visibleSatellites.set(sat.prnNumber, {
                  ...sat,
                  constellation: msg.talkerId
                });
              }
            });
          }
        });
        
        // Remove processed messages
        this.gsvMessages = this.gsvMessages.filter(msg => msg.talkerId !== gsv.talkerId);
      }
    } catch (error) {
      console.error('Error handling GSV:', error);
    }
  }

  private handleGSA(gsa: GSAPacket) {
    const now = Date.now();

    try {
      gsa.satellites.forEach(id => {
        if (id && id > 0) {
          this.satellitesInUse.set(id, {
            lastSeen: now
          });
        }
      });

      this.removeStaleEntries();
    } catch (error) {
      console.error('Error handling GSA:', error);
    }
  }

  private removeStaleEntries() {
    const now = Date.now();
    this.satellitesInUse.forEach((info, id) => {
      if (now - info.lastSeen > this.STALE_THRESHOLD_MS) {
        this.satellitesInUse.delete(id);
      }
    });
  }

  getData() {
    this.removeStaleEntries();
    
    return {
      position: this.position,
      errorStats: this.errorStats,
      satellites: {
        visible: Array.from(this.visibleSatellites.values()).sort((a, b) => a.prnNumber - b.prnNumber),
        inUse: Array.from(this.satellitesInUse.keys()).sort((a, b) => a - b)
      }
    };
  }
}
