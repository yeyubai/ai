import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/shared/db/prisma.service';
import { formatDateOnly, parseDateOnly } from 'src/shared/utils/date.utils';
import { ExportTaskResponseDto } from '../dto/export-task-response.dto';
import { UpdateUserProfileRequestDto } from '../dto/update-user-profile-request.dto';
import { UpdateUserSettingsRequestDto } from '../dto/update-user-settings-request.dto';
import { UpdateWeightGoalRequestDto } from '../dto/update-weight-goal-request.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { UserSettingsResponseDto } from '../dto/user-settings-response.dto';
import { WeightGoalResponseDto } from '../dto/weight-goal-response.dto';

type NullableProfile = {
  nickname: string | null;
  heightCm: number | null;
  sex: 'male' | 'female' | 'other' | null;
  birthDate: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
};

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: bigint): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileCompleted: true,
        profile: {
          where: { deletedAt: null },
          select: {
            nickname: true,
            heightCm: true,
            sex: true,
            birthDate: true,
            avatarUrl: true,
          },
        },
      },
    });

    const profile = user?.profile;
    const response: NullableProfile = {
      nickname: profile?.nickname ?? null,
      heightCm: profile?.heightCm ?? null,
      sex: (profile?.sex as 'male' | 'female' | 'other' | null) ?? null,
      birthDate: profile?.birthDate ? formatDateOnly(profile.birthDate) : null,
      avatarUrl: profile?.avatarUrl ?? null,
      onboardingCompleted: user?.profileCompleted ?? false,
    };
    return response;
  }

  async updateProfile(
    userId: bigint,
    payload: UpdateUserProfileRequestDto,
  ): Promise<UserProfileResponseDto> {
    const existingGoal = await this.prisma.weightGoal.findFirst({
      where: { userId, deletedAt: null },
      select: {
        startWeightKg: true,
        targetWeightKg: true,
      },
    });

    await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        nickname: payload.nickname,
        heightCm: payload.heightCm,
        sex: payload.sex,
        birthDate: payload.birthDate ? parseDateOnly(payload.birthDate) : null,
        avatarUrl: payload.avatarUrl,
        deletedAt: null,
      },
      create: {
        userId,
        nickname: payload.nickname ?? null,
        heightCm: payload.heightCm ?? 170,
        sex: payload.sex ?? null,
        birthDate: payload.birthDate ? parseDateOnly(payload.birthDate) : null,
        avatarUrl: payload.avatarUrl ?? null,
        currentWeightKg: existingGoal?.startWeightKg ?? 0,
        targetWeightKg: existingGoal?.targetWeightKg ?? 0,
      },
    });

    await this.syncProfileCompleted(userId);
    return this.getProfile(userId);
  }

  async getGoal(userId: bigint): Promise<WeightGoalResponseDto> {
    const goal = await this.prisma.weightGoal.findFirst({
      where: { userId, deletedAt: null },
      select: {
        startWeightKg: true,
        targetWeightKg: true,
        targetDate: true,
        weightUnit: true,
      },
    });

    return {
      startWeightKg: goal ? Number(goal.startWeightKg) : null,
      targetWeightKg: goal ? Number(goal.targetWeightKg) : null,
      targetDate: goal?.targetDate ? formatDateOnly(goal.targetDate) : null,
      weightUnit: (goal?.weightUnit as 'kg' | 'lb' | undefined) ?? 'kg',
    };
  }

  async updateGoal(
    userId: bigint,
    payload: UpdateWeightGoalRequestDto,
  ): Promise<WeightGoalResponseDto> {
    if (payload.targetWeightKg >= payload.startWeightKg) {
      throw new ConflictException({
        code: 'INVALID_GOAL',
        message: '目标体重需要小于起始体重',
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.weightGoal.upsert({
        where: { userId },
        update: {
          startWeightKg: payload.startWeightKg,
          targetWeightKg: payload.targetWeightKg,
          targetDate: payload.targetDate ? parseDateOnly(payload.targetDate) : null,
          weightUnit: payload.weightUnit,
          deletedAt: null,
        },
        create: {
          userId,
          startWeightKg: payload.startWeightKg,
          targetWeightKg: payload.targetWeightKg,
          targetDate: payload.targetDate ? parseDateOnly(payload.targetDate) : null,
          weightUnit: payload.weightUnit,
        },
      });

      await tx.userSetting.upsert({
        where: { userId },
        update: {
          weightUnit: payload.weightUnit,
          deletedAt: null,
        },
        create: {
          userId,
          weightUnit: payload.weightUnit,
        },
      });

      await tx.userProfile.updateMany({
        where: { userId, deletedAt: null },
        data: {
          currentWeightKg: payload.startWeightKg,
          targetWeightKg: payload.targetWeightKg,
        },
      });
    });

    await this.syncProfileCompleted(userId);
    return this.getGoal(userId);
  }

  async getSettings(userId: bigint): Promise<UserSettingsResponseDto> {
    const settings = await this.prisma.userSetting.findFirst({
      where: { userId, deletedAt: null },
      select: {
        diaryName: true,
        theme: true,
      },
    });

    return {
      diaryName: settings?.diaryName ?? '体重日记',
      theme: (settings?.theme as UserSettingsResponseDto['theme'] | undefined) ?? 'aqua-mist',
      exportEnabled: true,
    };
  }

  async updateSettings(
    userId: bigint,
    payload: UpdateUserSettingsRequestDto,
  ): Promise<UserSettingsResponseDto> {
    await this.prisma.userSetting.upsert({
      where: { userId },
      update: {
        diaryName: payload.diaryName,
        theme: payload.theme,
        deletedAt: null,
      },
      create: {
        userId,
        diaryName: payload.diaryName ?? '体重日记',
        theme: payload.theme ?? 'aqua-mist',
      },
    });

    return this.getSettings(userId);
  }

  createExport(): ExportTaskResponseDto {
    return {
      taskId: randomUUID(),
      status: 'queued',
      message: '导出任务已加入队列，首版为占位能力。',
    };
  }

  private async syncProfileCompleted(userId: bigint): Promise<void> {
    const [profile, goal] = await Promise.all([
      this.prisma.userProfile.findFirst({
        where: { userId, deletedAt: null },
        select: { heightCm: true },
      }),
      this.prisma.weightGoal.findFirst({
        where: { userId, deletedAt: null },
        select: { id: true },
      }),
    ]);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        profileCompleted: Boolean(profile?.heightCm && goal),
      },
    });
  }
}
