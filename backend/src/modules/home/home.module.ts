import { Module } from '@nestjs/common';
import { JourneyStateModule } from 'src/shared/state/journey-state.module';
import { AuthModule } from '../auth/auth.module';
import { HomeController } from './controllers/home.controller';
import { HomeService } from './services/home.service';

@Module({
  imports: [AuthModule, JourneyStateModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
