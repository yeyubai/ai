import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';

type AuthUserRecord = {
  id: bigint;
  phone: string;
  isGuest: boolean;
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
      update: {
        isGuest: false,
        deletedAt: null,
      },
      create: {
        phone,
        isGuest: false,
      },
      select: {
        id: true,
        phone: true,
        isGuest: true,
        profileCompleted: true,
      },
    });
  }

  async createGuestUser(phone: string): Promise<AuthUserRecord> {
    return this.prisma.user.create({
      data: {
        phone,
        isGuest: true,
        profileCompleted: true,
      },
      select: {
        id: true,
        phone: true,
        isGuest: true,
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

  async findUserByAccessToken(accessToken: string): Promise<AuthUserRecord | null> {
    const result = await this.prisma.authSession.findFirst({
      where: {
        accessToken,
        deletedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        user: {
          select: {
            id: true,
            phone: true,
            isGuest: true,
            profileCompleted: true,
          },
        },
      },
    });

    return result?.user ?? null;
  }

  async mergeGuestUserIntoMember(
    guestUserId: bigint,
    memberUserId: bigint,
  ): Promise<void> {
    if (guestUserId === memberUserId) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const [guestProfile, memberProfile, guestGoal, memberGoal, guestSettings, memberSettings] =
        await Promise.all([
          tx.userProfile.findFirst({ where: { userId: guestUserId, deletedAt: null } }),
          tx.userProfile.findFirst({ where: { userId: memberUserId, deletedAt: null } }),
          tx.weightGoal.findFirst({ where: { userId: guestUserId, deletedAt: null } }),
          tx.weightGoal.findFirst({ where: { userId: memberUserId, deletedAt: null } }),
          tx.userSetting.findFirst({ where: { userId: guestUserId, deletedAt: null } }),
          tx.userSetting.findFirst({ where: { userId: memberUserId, deletedAt: null } }),
        ]);

      if (guestProfile) {
        if (memberProfile) {
          await tx.userProfile.update({
            where: { id: memberProfile.id },
            data: {
              nickname: guestProfile.nickname ?? memberProfile.nickname,
              heightCm: guestProfile.heightCm ?? memberProfile.heightCm,
              sex: guestProfile.sex ?? memberProfile.sex,
              birthDate: guestProfile.birthDate ?? memberProfile.birthDate,
              avatarUrl: guestProfile.avatarUrl ?? memberProfile.avatarUrl,
              currentWeightKg:
                Number(guestProfile.currentWeightKg) > 0
                  ? guestProfile.currentWeightKg
                  : memberProfile.currentWeightKg,
              targetWeightKg:
                Number(guestProfile.targetWeightKg) > 0
                  ? guestProfile.targetWeightKg
                  : memberProfile.targetWeightKg,
            },
          });
          await tx.userProfile.update({
            where: { id: guestProfile.id },
            data: { deletedAt: new Date() },
          });
        } else {
          await tx.userProfile.update({
            where: { id: guestProfile.id },
            data: { userId: memberUserId },
          });
        }
      }

      if (guestGoal) {
        if (memberGoal) {
          await tx.weightGoal.update({
            where: { id: memberGoal.id },
            data: {
              startWeightKg: guestGoal.startWeightKg,
              targetWeightKg: guestGoal.targetWeightKg,
              targetDate: guestGoal.targetDate,
              weightUnit: guestGoal.weightUnit,
            },
          });
          await tx.weightGoal.update({
            where: { id: guestGoal.id },
            data: { deletedAt: new Date() },
          });
        } else {
          await tx.weightGoal.update({
            where: { id: guestGoal.id },
            data: { userId: memberUserId },
          });
        }
      }

      if (guestSettings) {
        if (memberSettings) {
          await tx.userSetting.update({
            where: { id: memberSettings.id },
            data: {
              diaryName: guestSettings.diaryName || memberSettings.diaryName,
              theme: guestSettings.theme || memberSettings.theme,
            },
          });
          await tx.userSetting.update({
            where: { id: guestSettings.id },
            data: { deletedAt: new Date() },
          });
        } else {
          await tx.userSetting.update({
            where: { id: guestSettings.id },
            data: { userId: memberUserId },
          });
        }
      }

      await tx.weightEntry.updateMany({
        where: { userId: guestUserId, deletedAt: null },
        data: { userId: memberUserId },
      });

      await tx.diaryEntry.updateMany({
        where: { userId: guestUserId, deletedAt: null },
        data: { userId: memberUserId },
      });

      await tx.authSession.updateMany({
        where: { userId: guestUserId, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      await tx.user.update({
        where: { id: guestUserId },
        data: { deletedAt: new Date() },
      });
    });
  }
}
