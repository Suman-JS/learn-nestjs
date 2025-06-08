import { User } from "@/auth/entities/user.entity";
import { ConfigWrapperModule } from "@/config/typed-config";
import { ONLY_USE_OUTSIDE_NEST_SERVICE_ENV, validateEnv } from "@/env";
import { Post } from "@/posts/entities/post.entity";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PostsModule } from "./posts/posts.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.DB_HOST,
      port: ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.DB_PORT,
      username: ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.DB_USERNAME,
      password: ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.DB_PASSWORD,
      database: ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.DB_NAME,
      entities: [Post, User],
      synchronize:
        ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.NODE_ENV === "development"
          ? true
          : false,
    }),
    ConfigWrapperModule,
    PostsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
