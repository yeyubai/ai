import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckinsModule } from './modules/checkins/checkins.module';
import { HealthModule } from './modules/health/health.module';
import { HomeModule } from './modules/home/home.module';
import { MembershipModule } from './modules/membership/membership.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ReviewModule } from './modules/review/review.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PrismaModule } from './shared/db/prisma.module';
import { AppLogger } from './shared/logger/app-logger.service';
import { TraceIdMiddleware } from './shared/middleware/trace-id.middleware';
import { JourneyStateModule } from './shared/state/journey-state.module';

@Module({
  imports: [
    PrismaModule,
    JourneyStateModule,
    HealthModule,
    AuthModule,
    ProfileModule,
    OnboardingModule,
    HomeModule,
    CheckinsModule,
    ReviewModule,
    ProgressModule,
    MembershipModule,
    SettingsModule,
    AiModule,
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
