import 'dotenv/config';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from './shared/config/env.config';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ApiResponseInterceptor } from './shared/interceptors/api-response.interceptor';
import { AppLogger } from './shared/logger/app-logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);

  app.useLogger(logger);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = envConfig.port;
  await app.listen(port);
  logger.log(`backend listening on http://localhost:${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
