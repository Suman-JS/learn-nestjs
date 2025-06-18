import { CacheModule } from "@nestjs/cache-manager";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { AuthModule } from "@/auth/auth.module";
import { User } from "@/auth/entities/user.entity";
import { ChatModule } from "@/chat/chat.module";
import { LoggerMiddleware } from "@/common/middlewares/logger.middleware";
import { ConfigWrapperModule } from "@/config/typed-config";
import { ONLY_USE_OUTSIDE_NEST_SERVICE_ENV, validateEnv } from "@/env";
import { EventsModule } from "@/events/events.module";
import { File } from "@/file-upload/entities/file.entity";
import { FileUploadModule } from "@/file-upload/file-upload.module";
import { Post } from "@/posts/entities/post.entity";
import { PostsModule } from "@/posts/posts.module";
import { SseModule } from "@/sse/sse.module";

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 30_000,
    }),
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
      entities: [Post, User, File],
      synchronize:
        ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.NODE_ENV === "development"
          ? true
          : false,
    }),
    ConfigWrapperModule,
    PostsModule,
    AuthModule,
    FileUploadModule,
    EventsModule,
    ChatModule,
    SseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*path");
  }
}
