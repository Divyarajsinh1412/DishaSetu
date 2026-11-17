import { EventEmitter } from 'events';

class SyncService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Set();
  }

  // Register an SSE client connection
  addClient(res) {
    this.clients.add(res);

    // Initial connection message
    res.write(`data: ${JSON.stringify({ event: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  // Broadcast an update to all connected clients
  broadcast(event, data) {
    const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      try {
        client.write(`data: ${payload}\n\n`);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  // Get active listener count
  getConnectedCount() {
    return this.clients.size;
  }
}

export const syncService = new SyncService();
export default syncService;
