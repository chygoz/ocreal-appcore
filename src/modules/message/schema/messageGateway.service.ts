// message.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  handleMessage(client: any, payload: any): void {
    // Handle incoming messages
    this.server.emit('message', payload);
  }
}
