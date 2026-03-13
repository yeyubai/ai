import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProgressController } from './controllers/progress.controller';
import { ProgressService } from './services/progress.service';

@Module({
  imports: [AuthModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
