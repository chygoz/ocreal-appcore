import { UseGuards } from '@nestjs/common';
import {
  // MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketGuard } from 'src/guards/socket.guard';
// import { Server, Socket } from 'socket.io';
// import { SocketService } from './socket.service';

@WebSocketGateway()
export class SocketGateway {
  @WebSocketServer()
  server;

  @UseGuards(SocketGuard)
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): void {
    console.log(payload);
    this.server.emit('message', payload);
  }

  // Implement other Socket.IO event handlers and message handlers
}

// src/websocket.gateway.ts
// import {
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Server } from 'socket.io';

// @WebSocketGateway()
// export class WebSocketGateway {
//   @WebSocketServer() server: Server;

//   @SubscribeMessage('message')
//   handleMessage(client: any, payload: any): void {
//     this.server.emit('message', payload); // Broadcast message to all connected clients
//   }
// }
