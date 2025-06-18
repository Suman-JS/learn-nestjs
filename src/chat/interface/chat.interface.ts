export enum SocketEvents {
  "MESSAGE_CREATED" = "message_created",
  "CREATE_MESSAGE" = "create_message",
  "MESSAGE" = "message",
}

export interface CreateMessagePayload {
  userId: string;
  text: string;
}

export type Message = Omit<CreateMessagePayload, "userId">;
