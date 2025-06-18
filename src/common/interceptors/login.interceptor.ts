import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { tap } from "rxjs/operators";

import { RequestWithUser } from "@/auth/decorators/current-user.decorator";

@Injectable()
export class LoginInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoginInterceptor.name);

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();

    const { method, url } = req;
    const userAgent = req.get("user-agent") || "unknown";

    const userId = req?.user?.id || "unauthenticated";

    this.logger.log(`
        [${method} ${url} - User: ${userId} User-Agent: ${userAgent}]`);

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${method} ${url} - ${duration}ms] - Response size ${JSON.stringify(data).length || 0} bytes`,
          );
        },
        error: (err: Error) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${method} ${url} - ${duration}ms] - [Error ${err?.message}]`,
          );
        },
      }),
    );
  }
}
