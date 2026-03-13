import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MembershipController } from './controllers/membership.controller';
import { MembershipService } from './services/membership.service';

@Module({
  imports: [AuthModule],
  controllers: [MembershipController],
  providers: [MembershipService],
})
export class MembershipModule {}
