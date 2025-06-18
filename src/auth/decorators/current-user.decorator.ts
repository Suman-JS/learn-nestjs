import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

import { User } from "@/auth/entities/user.entity";

export interface RequestWithUser extends Request {
  user?: Omit<User, "password">;
}

export const CurrentUser = createParamDecorator<User>(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
