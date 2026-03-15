import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() payload: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(payload);
  }

  @Post('guest')
  @HttpCode(HttpStatus.OK)
  createGuestSession(): Promise<LoginResponseDto> {
    return this.authService.createGuestSession();
  }
}
