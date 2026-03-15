import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { WeightsController } from './controllers/weights.controller';
import { WeightsService } from './services/weights.service';

@Module({
  imports: [AuthModule],
  controllers: [WeightsController],
  providers: [WeightsService],
  exports: [WeightsService],
})
export class WeightsModule {}
