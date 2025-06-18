import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { UserRegisteredEvent } from "@/events/user-events.service";

@Injectable()
export class UserRegistrationListener {
  private readonly logger = new Logger(UserRegistrationListener.name);

  @OnEvent("user.registration")
  handleUserRegistrationEvent(event: UserRegisteredEvent) {
    const { timeStamp, user } = event;

    this.logger.log(
      `Welcome, ${user.email}! Your account created at ${timeStamp.toISOString()}`,
    );
  }
}
