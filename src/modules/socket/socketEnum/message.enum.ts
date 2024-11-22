export enum MessageServiceSocketEnum {
  CREATE_CONVERSATION = 'create_conversation',
  CONVERSATION_CREATED = 'conversation_created',
  LIST_CONVERSATION = 'list_conversation',
  CONVERSATION_LISTED = 'conversation_listed',
  GET_CONVERSATION = 'get_conversation',
  CONVERSATION_RETRIEVED = 'conversation_retrieved',

  /////// MESSAGE ENUM  ///////

  SEND_MESSAGE = 'send_message',
  MESSAGE_SENT = 'message_sent',
  RECEIVE_MESSAGE = 'receive_message',
  LIST_MESSAGES = 'list_messages',
  MESSAGES_LISTED = 'messages_listed',

  VIEW_MESSAGES = 'view_messages',
  ALL_VIEWED_MESSAGES = 'all_viewed_messages',

  LIST_CONVERSIONS_BY_PROPERTY = 'list_conversations_by_property',
  PROPERTY_CONVERSATION_RETRIEVED = 'property_conversation_retrieved',
}

export enum OpenMessageServiceSocketEnum {
  OPEN_CONVERSATION = 'open_conversation',
  CONVERSATION_OPENED = 'conversation_opened',
  LIST_OPEN_CONVERSATION = 'list_open_conversation',
  OPEN_CONVERSATION_LISTED = 'open_conversation_listed',

  JOIN_CONVERSATION = 'join_conversation',
  CONVERSATION_JOINED = 'conversation_joined',

  SEND_CHAT_MESSAGE = 'send_chat_message',
  CHAT_MESSAGE_SENT = 'chat_message_sent',
  LIST_CHAT_MESSAGES = 'list_chat_messages',
  CHAT_MESSAGE_LISTED = 'chat_message_listed',
}

export enum SocketErrorEnum {
  ERROR = 'error',
}
