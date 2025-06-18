import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { UserRegistrationListener } from "@/events/listeners/user-register.listener";
import { UserEventsService } from "./user-events.service";

@Module({
  providers: [UserEventsService, UserRegistrationListener],
  exports: [UserEventsService],
  imports: [
    EventEmitterModule.forRoot({
      global: true,
      wildcard: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
  ],
})
export class EventsModule {}
