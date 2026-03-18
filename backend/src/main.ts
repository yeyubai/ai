import 'dotenv/config';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from './shared/config/env.config';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ApiResponseInterceptor } from './shared/interceptors/api-response.interceptor';
import { AppLogger } from './shared/logger/app-logger.service';

const LOCAL_DEV_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(?::\d+)?$/i,
  /^https?:\/\/127(?:\.\d{1,3}){3}(?::\d+)?$/i,
  /^https?:\/\/10\.0\.2\.2(?::\d+)?$/i,
  /^https?:\/\/192\.168(?:\.\d{1,3}){2}(?::\d+)?$/i,
  /^https?:\/\/10(?:\.\d{1,3}){3}(?::\d+)?$/i,
  /^https?:\/\/172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}(?::\d+)?$/i,
  /^capacitor:\/\/localhost$/i,
  /^ionic:\/\/localhost$/i,
];

function isLocalDevOrigin(origin: string): boolean {
  return LOCAL_DEV_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  const configuredCorsOrigins = new Set(envConfig.corsOrigins);
  const allowAllOrigins = configuredCorsOrigins.has('*');
  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        allowAllOrigins ||
        configuredCorsOrigins.has(origin) ||
        (isDevelopment && isLocalDevOrigin(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-trace-id',
      'x-idempotency-key',
    ],
    exposedHeaders: ['x-trace-id'],
  });

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
