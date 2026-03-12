import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './shared/db/prisma.module';
import { AppLogger } from './shared/logger/app-logger.service';
import { TraceIdMiddleware } from './shared/middleware/trace-id.middleware';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule, AiModule],
  providers: [AppLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TraceIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
