// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   OnGatewayInit,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';

// import { Server } from 'socket.io';

// @WebSocketGateway({ namespace: 'message'  })
// export class ChatGateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer() io: Server;

//   handleConnection(client: any, ...args: any[]) {
//     const { sockets } = this.io.sockets;

//     this.logger.log(`Client id: ${client.id} connected`);
//     this.logger.debug(`Number of connected clients: ${sockets.size}`);
//   }

//   handleDisconnect(client: any) {
//     this.logger.log(`Cliend id:${client.id} disconnected`);
//   }

//   @SubscribeMessage('ping')
//   handleMessage(client: any, data: any) {
//     this.logger.log(`Message received from client id: ${client.id}`);
//     this.logger.debug(`Payload: ${data}`);
//     return {
//       event: 'pong',
//       data: 'Wrong data that will make the test fail',
//     };
//   }
// }
