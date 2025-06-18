import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "@/auth/entities/user.entity";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { JwtStrategy } from "@/auth/strategies/jwt.strategy";
import { ConfigWrapperModule } from "@/config/typed-config";
import { EventsModule } from "@/events/events.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigWrapperModule,
    JwtModule.register({}),
    PassportModule,
    EventsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
