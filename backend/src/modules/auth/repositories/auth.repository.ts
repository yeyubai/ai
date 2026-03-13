import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';

type AuthUserRecord = {
  id: bigint;
  phone: string;
  profileCompleted: boolean;
};

type CreateSessionPayload = {
  userId: bigint;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertUserByPhone(phone: string): Promise<AuthUserRecord> {
    return this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
      select: {
        id: true,
        phone: true,
        profileCompleted: true,
      },
    });
  }

  async createSession(payload: CreateSessionPayload): Promise<void> {
    await this.prisma.authSession.create({
      data: {
        userId: payload.userId,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        expiresAt: payload.expiresAt,
      },
    });
  }

  async findValidSessionByAccessToken(accessToken: string): Promise<{
    userId: bigint;
    expiresAt: Date;
  } | null> {
    return this.prisma.authSession.findFirst({
      where: {
        accessToken,
        deletedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        userId: true,
        expiresAt: true,
      },
    });
  }
}
