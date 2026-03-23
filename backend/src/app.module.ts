import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CoachModule } from './modules/coach/coach.module';
import { DiaryModule } from './modules/diary/diary.module';
import { HealthModule } from './modules/health/health.module';
import { HomeModule } from './modules/home/home.module';
import { MeModule } from './modules/me/me.module';
import { WeightsModule } from './modules/weights/weights.module';
import { PrismaModule } from './shared/db/prisma.module';
import { AppLogger } from './shared/logger/app-logger.service';
import { TraceIdMiddleware } from './shared/middleware/trace-id.middleware';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    CoachModule,
    DiaryModule,
    HomeModule,
    MeModule,
    WeightsModule,
  ],
  providers: [AppLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TraceIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
