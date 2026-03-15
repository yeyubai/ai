import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { MeController } from './controllers/me.controller';
import { MeService } from './services/me.service';

@Module({
  imports: [AuthModule],
  controllers: [MeController],
  providers: [MeService],
  exports: [MeService],
})
export class MeModule {}
