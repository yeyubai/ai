import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

type AuthenticatedRequest = {
  userId?: bigint;
};

export const CurrentUserId = createParamDecorator(
  (_: unknown, context: ExecutionContext): bigint => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.userId) {
      throw new UnauthorizedException('AUTH_EXPIRED');
    }

    return request.userId;
  },
);
