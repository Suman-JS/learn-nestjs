import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "@/app.module";
import { LoginInterceptor } from "@/common/interceptors/login.interceptor";
import { ONLY_USE_OUTSIDE_NEST_SERVICE_ENV } from "@/env";

async function bootstrap() {
  // const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "fatal", "verbose"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  app.enableCors({
    origin: "*",
  });

  app.setGlobalPrefix("v1");

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "v",
  });

  app.useGlobalInterceptors(new LoginInterceptor());

  await app.listen(ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.PORT);
}
bootstrap()
  .then(() => {})
  .catch(console.error);
