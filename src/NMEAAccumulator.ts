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

interface GSVSequence {
  expectedMessage: number;
  messageCount: number;
  messages: Map<number, GSVPacket>;
}

export class NMEAAccumulator {
  private sequences = new Map<string, GSVSequence>();  // talkerId -> sequence
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
      const talkerId = gsv.talkerId;
      const messageNumber = gsv.messageNumber;
      
      // Get or create sequence for this talker
      let sequence = this.sequences.get(talkerId);

      // If this is message #1, start a new sequence
      if (messageNumber === 1) {
        sequence = {
          expectedMessage: 1,
          messageCount: gsv.numberOfMessages,
          messages: new Map()
        };
        this.sequences.set(talkerId, sequence);

      } else if (!sequence || messageNumber !== sequence.expectedMessage) {
        // Reject out-of-order message
        return;
      }

      // Add message to sequence and increment expected message number
      sequence.messages.set(messageNumber, gsv);
      sequence.expectedMessage++;

      // Check if sequence is complete
      if (sequence.messages.size === sequence.messageCount) {
        this.processCompleteSequence(talkerId, sequence);
        this.sequences.delete(talkerId);
      }
    } catch (error) {
      console.error('Error handling GSV:', error);
    }
  }

  private processCompleteSequence(talkerId: string, sequence: GSVSequence) {
    // Clear existing satellites for this constellation
    this.visibleSatellites.forEach((sat, id) => {
      if (sat.constellation === talkerId) {
        this.visibleSatellites.delete(id);
      }
    });

    // Process all satellites from the complete sequence
    for (let i = 1; i <= sequence.messageCount; i++) {
      const msg = sequence.messages.get(i);
      if (msg?.satellites) {
        msg.satellites.forEach(sat => {
          if (sat && sat.prnNumber && sat.prnNumber > 0 // &&
            // !Number.isNaN(sat.elevationDegrees) && 
            // !Number.isNaN(sat.azimuthTrue)
            ) {
            this.visibleSatellites.set(sat.prnNumber, {
              ...sat,
              constellation: talkerId
            });
          }
        });
      } else {
          console.log("Missing Packet in Sequence");
      }
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
