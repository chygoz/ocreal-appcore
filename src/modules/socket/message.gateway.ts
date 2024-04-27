// import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  // MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from './interfaces/message.interface';
import { Chat } from '../message/schema/chat.schema';
import { User } from '../users/schema/user.schema';
import { BadRequestException } from '@nestjs/common';
// import { SocketGuard } from 'src/guards/socket.guard';
// import { Server, Socket } from 'socket.io';
// import { SocketService } from './socket.service';

@WebSocketGateway()
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  // server: Server<any, ISocketEvent>;
  private rooms: Room[] = [];
  // @UseGuards(SocketGuard)

  @SubscribeMessage('newChat')
  handleNewChat(client: any, payload: any) {
    // this.server.emit('newChat', payload);
    return 'Hello World';
  }

  sendNewChat(chat: Chat) {
    // console.log(payload);
    this.server.emit('newChat', chat);
  }

  @SubscribeMessage('join_room')
  async handleSetClientDataEvent(
    @MessageBody()
    payload: {
      roomName: string;
      user: User;
    },
  ) {
    if (payload.user.socketId) {
      // this.logger.log(
      //   `${payload.user.socketId} is joining ${payload.roomName}`,
      // );
      // const canJoin = await this.propertyService.confirmUserPropertyConnection(
      //   payload.user.id,
      //   payload.roomName,
      // );
      // if (!canJoin) {
      //   throw new BadRequestException('You can not join this room');
      // }
      this.server.in(payload.user.socketId).socketsJoin(payload.roomName);
      await this.addUserToRoom(payload.roomName, payload.user);
    }
  }

  sendMessage(payload: any) {
    this.server.emit('newMessage', payload);
  }

  async handleConnection(socket: Socket): Promise<void> {
    // const roomName = socket.handshake.query.room;
    // this.logger.log(`Socket connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    await this.removeUserFromAllRooms(socket.id);
    // this.logger.log(`Socket disconnected: ${socket.id}`);
  }

  async addRoom(roomName: string, host: User): Promise<void> {
    const room = await this.getRoomByName(roomName);
    if (room === -1) {
      this.rooms.push({ name: roomName, host, users: [host] });
    }
  }

  async removeRoom(roomName: string): Promise<void> {
    const findRoom = await this.getRoomByName(roomName);
    if (findRoom !== -1) {
      this.rooms = this.rooms.filter((room) => room.name !== roomName);
    }
  }

  async getRoomHost(hostName: string): Promise<User> {
    const roomIndex = await this.getRoomByName(hostName);
    return this.rooms[roomIndex].host;
  }

  async getRoomByName(roomName: string): Promise<number> {
    const roomIndex = this.rooms.findIndex((room) => room?.name === roomName);
    return roomIndex;
  }

  async addUserToRoom(roomName: string, user: User): Promise<void> {
    const roomIndex = await this.getRoomByName(roomName);
    if (roomIndex !== -1) {
      this.rooms[roomIndex].users.push(user);
      const host = await this.getRoomHost(roomName);
      if (host.id === user.id) {
        this.rooms[roomIndex].host.socketId = user.socketId;
      }
    } else {
      await this.addRoom(roomName, user);
    }
  }

  async findRoomsByUserSocketId(socketId: string): Promise<Room[]> {
    const filteredRooms = this.rooms.filter((room) => {
      const found = room.users.find((user) => user.socketId === socketId);
      if (found) {
        return found;
      }
    });
    return filteredRooms;
  }

  async removeUserFromAllRooms(socketId: string): Promise<void> {
    const rooms = await this.findRoomsByUserSocketId(socketId);
    for (const room of rooms) {
      await this.removeUserFromRoom(socketId, room.name);
    }
  }

  async removeUserFromRoom(socketId: string, roomName: string): Promise<void> {
    const room = await this.getRoomByName(roomName);
    this.rooms[room].users = this.rooms[room].users.filter(
      (user) => user.socketId !== socketId,
    );
    if (this.rooms[room].users.length === 0) {
      await this.removeRoom(roomName);
    }
  }

  async getRooms(): Promise<Room[]> {
    return this.rooms;
  }
}
