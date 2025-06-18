import { Injectable } from "@nestjs/common";

import { CreateMessagePayload } from "@/chat/interface/chat.interface";

@Injectable()
export class ChatService {
  saveMessage(payload: CreateMessagePayload) {
    console.log("Saving message:", payload);
    return { ...payload, id: Date.now() };
  }
}
