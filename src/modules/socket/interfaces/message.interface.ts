import { Chat } from 'src/modules/message/schema/chat.schema';
import { User } from 'src/modules/users/schema/user.schema';

export interface ISocketEvent {
  newChat: (payload: Chat) => void;
}

export interface Room {
  name: string;
  host: User;
  users: User[];
}
