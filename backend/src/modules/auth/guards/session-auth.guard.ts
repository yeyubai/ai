import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  userId?: bigint;
};

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = this.extractBearerToken(request.headers.authorization);

    if (!accessToken) {
      throw new UnauthorizedException('AUTH_EXPIRED');
    }

    const userId = await this.authService.getUserIdByAccessToken(accessToken);
    if (!userId) {
      throw new UnauthorizedException('AUTH_EXPIRED');
    }

    request.userId = userId;
    return true;
  }

  private extractBearerToken(
    authorization: string | string[] | undefined,
  ): string | null {
    if (typeof authorization !== 'string') {
      return null;
    }

    if (!authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.slice('Bearer '.length).trim();
    return token.length > 0 ? token : null;
  }
}
