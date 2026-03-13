import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HomeController } from './controllers/home.controller';
import { HomeService } from './services/home.service';

@Module({
  imports: [AuthModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
