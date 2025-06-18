import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { ChatService } from "@/chat/chat.service";
import {
  CreateMessagePayload,
  Message,
  SocketEvents,
} from "@/chat/interface/chat.interface";

@WebSocketGateway({
  cors: {
    origin: "*",
    allowedHeaders: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SocketEvents.MESSAGE)
  handleMessage(client: Socket, payload: Message): void {
    console.log(`Message from ${client.id}:`, payload);
    this.server.emit(SocketEvents.MESSAGE, payload);
  }

  @SubscribeMessage(SocketEvents.CREATE_MESSAGE)
  handleCreateMessage(client: Socket, payload: CreateMessagePayload) {
    console.log("message received", payload);
    const result = this.chatService.saveMessage(payload);
    client.emit(SocketEvents.MESSAGE_CREATED, result);
  }
}
