import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, SessionAuthGuard],
  exports: [AuthService, AuthRepository, SessionAuthGuard],
})
export class AuthModule {}
