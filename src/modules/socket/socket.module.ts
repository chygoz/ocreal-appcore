import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { MessageGateway } from './message.gateway';

@Module({
  imports: [],
  providers: [MessageGateway, SocketService],
})
export class SocketModule {}
