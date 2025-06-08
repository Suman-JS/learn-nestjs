import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { ONLY_USE_OUTSIDE_NEST_SERVICE_ENV } from "@/env";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(ONLY_USE_OUTSIDE_NEST_SERVICE_ENV.PORT);
}
bootstrap();
