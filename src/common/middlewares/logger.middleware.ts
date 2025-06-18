import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "unknown";
    this.logger.log(
      `[Incoming] ${method} ${originalUrl} - ${ip} - ${userAgent}`,
    );
    req["startTime"] = Date.now();

    req.on("finish", () => {
      const duration = Date.now() - req["startTime"];
      const { status } = res;

      if (status >= 500) {
        this.logger.error(
          `[Response] ${method} ${originalUrl} - ${status} - ${duration}ms`,
        );
      } else if (status >= 400) {
        this.logger.warn(
          `[Response] ${method} ${originalUrl} - ${status} - ${duration}ms`,
        );
      } else {
        this.logger.log(
          `[Response] ${method} ${originalUrl} - ${status} - ${duration}ms`,
        );
      }
    });
    next();
  }
}
