import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { EnvService } from '@cfg/schema/env.service';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  const envService = app.get(EnvService);
  app.use(cookieParser());
  app.enableCors({
    origin: envService.frontendUrl,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api');

  await app.listen(envService.port);
  logger.log(`Application is running on port: ${envService.port}`);
}
bootstrap();
