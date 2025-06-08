import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "@/auth/auth.service";
import { TypedConfigService } from "@/config/typed-config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: TypedConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_ACCESS_TOKEN_SECRET"),
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.authService.getUserById(payload.sub);
      return {
        ...user,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
