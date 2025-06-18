import { User } from "@/auth/entities/user.entity";
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = User>(
    err: Error | null,
    user: TUser,
    info: { name?: string } | undefined,
    _context: ExecutionContext,
    _status?: any,
  ): TUser {
    if (info?.name === "TokenExpiredError") {
      throw new ForbiddenException("Access token expired");
    }

    if (err || !user) {
      throw new UnauthorizedException("Invalid or missing token");
    }

    return user;
  }
}
