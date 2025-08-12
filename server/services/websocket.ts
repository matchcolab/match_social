import { WebSocketServer, WebSocket } from "ws";
import { type Server } from "http";

interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
  lastSeen: Date;
}

export class CommunityWebSocket {
  private wss: WebSocketServer;
  private clients: Map<string, ConnectedClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
    this.setupHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, {
        ws,
        lastSeen: new Date(),
      });

      console.log(`Client ${clientId} connected. Total clients: ${this.clients.size}`);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        this.broadcastOnlineCount();
        console.log(`Client ${clientId} disconnected. Total clients: ${this.clients.size}`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });

      // Send initial data
      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        onlineCount: this.getOnlineCount(),
      });

      this.broadcastOnlineCount();
    });
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          // Update last seen
          client.lastSeen = now;
          
          // Send ping
          client.ws.ping();
        } else {
          // Remove dead connections
          this.clients.delete(clientId);
        }
      });

      this.broadcastOnlineCount();
    }, 30000); // 30 seconds
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'auth':
        // Associate user ID with client
        client.userId = message.userId;
        this.clients.set(clientId, client);
        console.log(`Client ${clientId} authenticated as user ${message.userId}`);
        break;

      case 'join_room':
        // Handle room joining for groups, etc.
        this.handleJoinRoom(clientId, message.room);
        break;

      case 'leave_room':
        this.handleLeaveRoom(clientId, message.room);
        break;

      case 'pong':
        // Client responded to ping
        client.lastSeen = new Date();
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleJoinRoom(clientId: string, room: string) {
    // Implementation for room-based messaging (groups, etc.)
    console.log(`Client ${clientId} joined room ${room}`);
  }

  private handleLeaveRoom(clientId: string, room: string) {
    // Implementation for leaving rooms
    console.log(`Client ${clientId} left room ${room}`);
  }

  private sendToClient(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }

  private broadcast(data: any, excludeClientId?: string) {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(data));
      }
    });
  }

  private broadcastOnlineCount() {
    const onlineCount = this.getOnlineCount();
    this.broadcast({
      type: 'online_count_update',
      count: onlineCount,
    });
  }

  private getOnlineCount(): number {
    let activeClients = 0;
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        activeClients++;
      }
    });
    return activeClients;
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Public methods for triggering broadcasts from the API
  public broadcastNewResponse(response: any) {
    this.broadcast({
      type: 'new_response',
      response,
    });
  }

  public broadcastNewComment(comment: any) {
    this.broadcast({
      type: 'new_comment',
      comment,
    });
  }

  public broadcastLikeUpdate(targetId: string, likeCount: number, isLiked: boolean) {
    this.broadcast({
      type: 'like_update',
      targetId,
      likeCount,
      isLiked,
    });
  }

  public broadcastIntroductionRequest(userId: string, introduction: any) {
    // Send to specific user
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        this.sendToClient(clientId, {
          type: 'new_introduction_request',
          introduction,
        });
      }
    });
  }

  public cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
  }
}
