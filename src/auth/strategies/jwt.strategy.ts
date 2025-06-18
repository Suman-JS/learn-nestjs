import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "@/auth/auth.service";
import { UserRole } from "@/auth/entities/user.entity";
import { TypedConfigService } from "@/config/typed-config";

interface Payload {
  email: string;
  sub: number;
  role: UserRole;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: TypedConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_ACCESS_TOKEN_SECRET"),
    });
  }

  async validate(payload: Payload) {
    try {
      const user = await this.authService.getUserById(payload.sub);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
