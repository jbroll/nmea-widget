import { 
  GSVPacket,
  GSAPacket,
  GGAPacket,
  GSTPacket,
  parseNmeaSentence,
} from 'nmea-simple';

interface SatelliteUseInfo {
  lastSeen: number;
}

export class NMEAAccumulator {
  private gsvCollections = new Map<string, GSVPacket[]>();
  private position: GGAPacket | null = null;
  private errorStats: GSTPacket | null = null;
  private visibleSatellites = new Map<string, Map<number, GSVPacket['satellites'][0]>>();
  private satellitesInUse = new Map<string, Map<number, SatelliteUseInfo>>();
  private readonly STALE_THRESHOLD_MS = 5000;
  
  private getConstellationId(satId: number): string {
    if (satId >= 1 && satId <= 32) return 'GP';
    if (satId >= 65 && satId <= 96) return 'GL';
    if (satId >= 201 && satId <= 236) return 'GB';
    if (satId >= 401 && satId <= 463) return 'BD';
    return 'GP';
  }

  constructor() {
    ['GP', 'GL', 'GB', 'BD'].forEach(id => {
      this.visibleSatellites.set(id, new Map());
      this.satellitesInUse.set(id, new Map());
    });
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
      const collectionId = gsv.talkerId;
      
      // Initialize collection if it doesn't exist
      if (!this.gsvCollections.has(collectionId)) {
        this.gsvCollections.set(collectionId, []);
      }
      
      const collection = this.gsvCollections.get(collectionId)!;
      
      // Update or add the message in the collection
      const existingIndex = collection.findIndex(msg => msg.messageNumber === gsv.messageNumber);
      if (existingIndex !== -1) {
        collection[existingIndex] = gsv;
      } else {
        collection.push(gsv);
      }

      // Check if we have all messages for this constellation
      const isComplete = collection.length === gsv.numberOfMessages;
      const messageNumbers = new Set(collection.map(msg => msg.messageNumber));
      const hasAllMessageNumbers = messageNumbers.size === gsv.numberOfMessages;
      
      if (isComplete && hasAllMessageNumbers) {
        // Sort by message number
        collection.sort((a, b) => a.messageNumber - b.messageNumber);
        
        // Get the constellation's satellite map
        const constellationSats = this.visibleSatellites.get(collectionId);
        if (!constellationSats) {
          console.error(`No satellite map for constellation: ${collectionId}`);
          return;
        }
        
        // Clear existing satellites for this constellation
        constellationSats.clear();
        
        // Process all satellites from the complete set
        collection.forEach(msg => {
          if (msg.satellites) {
            msg.satellites.forEach(sat => {
              if (sat && sat.prnNumber && sat.prnNumber > 0) {
                constellationSats.set(sat.prnNumber, sat);
              }
            });
          }
        });
        
        // Clear the collection after processing
        this.gsvCollections.set(collectionId, []);
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
          const constellationId = this.getConstellationId(id);
          const constellationSats = this.satellitesInUse.get(constellationId);
          
          if (constellationSats) {
            constellationSats.set(id, { lastSeen: now });
          }
        }
      });

      this.removeStaleEntries();
    } catch (error) {
      console.error('Error handling GSA:', error);
    }
  }

  private removeStaleEntries() {
    const now = Date.now();
    this.satellitesInUse.forEach(satellites => {
      satellites.forEach((info, id) => {
        if (now - info.lastSeen > this.STALE_THRESHOLD_MS) {
          satellites.delete(id);
        }
      });
    });
  }

  getData() {
    this.removeStaleEntries();
    
    return {
      position: this.position,
      errorStats: this.errorStats,
      satellites: {
        visible: Object.fromEntries([...this.visibleSatellites].map(([id, sats]) => 
          [id, [...sats.values()]]
        )),
        inUse: Object.fromEntries([...this.satellitesInUse].map(([id, sats]) => 
          [id, Array.from(sats.keys())]
        ))
      }
    };
  }
}