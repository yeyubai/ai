import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CheckinsController } from './controllers/checkins.controller';
import { CheckinsRepository } from './repositories/checkins.repository';
import { CheckinsService } from './services/checkins.service';

@Module({
  imports: [AuthModule],
  controllers: [CheckinsController],
  providers: [CheckinsService, CheckinsRepository],
})
export class CheckinsModule {}
