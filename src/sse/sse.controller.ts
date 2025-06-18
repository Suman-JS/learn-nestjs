import { Controller, MessageEvent, Sse } from "@nestjs/common";
import { interval, map, Observable } from "rxjs";

@Controller("sse")
export class SseController {
  @Sse("events")
  sendEvent(): Observable<MessageEvent> {
    return interval(1000).pipe(
      map((i) => ({
        data: { time: new Date().toISOString(), count: i },
      })),
    );
  }
}
