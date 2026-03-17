import { Prisma } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';

type UpdateProfilePayload = {
  userId: bigint;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
};

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(userId: bigint): Promise<{
    id: bigint;
    phone: string;
    profileCompleted: boolean;
  } | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        phone: true,
        profileCompleted: true,
      },
    });
  }

  async findActiveProfileByUserId(userId: bigint): Promise<{
    userId: bigint;
    heightCm: number;
    currentWeightKg: Decimal;
    targetWeightKg: Decimal;
  } | null> {
    return this.prisma.userProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        userId: true,
        heightCm: true,
        currentWeightKg: true,
        targetWeightKg: true,
      },
    });
  }

  async findActiveGoalByUserId(userId: bigint): Promise<{
    userId: bigint;
    startWeightKg: Decimal;
    targetWeightKg: Decimal;
  } | null> {
    return this.prisma.weightGoal.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        userId: true,
        startWeightKg: true,
        targetWeightKg: true,
      },
    });
  }

  async runInTransaction<T>(
    handler: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(handler);
  }

  async upsertProfile(
    tx: Prisma.TransactionClient,
    payload: UpdateProfilePayload,
  ): Promise<void> {
    await tx.userProfile.upsert({
      where: { userId: payload.userId },
      update: {
        heightCm: payload.heightCm,
        currentWeightKg: payload.currentWeightKg,
        targetWeightKg: payload.targetWeightKg,
        deletedAt: null,
      },
      create: {
        userId: payload.userId,
        heightCm: payload.heightCm,
        currentWeightKg: payload.currentWeightKg,
        targetWeightKg: payload.targetWeightKg,
      },
    });
  }

  async upsertGoal(
    tx: Prisma.TransactionClient,
    payload: UpdateProfilePayload,
  ): Promise<void> {
    const [existingGoal, settings] = await Promise.all([
      tx.weightGoal.findFirst({
        where: {
          userId: payload.userId,
          deletedAt: null,
        },
        select: {
          weightUnit: true,
        },
      }),
      tx.userSetting.findFirst({
        where: {
          userId: payload.userId,
          deletedAt: null,
        },
        select: {
          weightUnit: true,
        },
      }),
    ]);
    const weightUnit = (existingGoal?.weightUnit ?? settings?.weightUnit ?? 'kg') as
      | 'kg'
      | 'lb';

    await tx.weightGoal.upsert({
      where: { userId: payload.userId },
      update: {
        startWeightKg: payload.currentWeightKg,
        targetWeightKg: payload.targetWeightKg,
        weightUnit,
        deletedAt: null,
      },
      create: {
        userId: payload.userId,
        startWeightKg: payload.currentWeightKg,
        targetWeightKg: payload.targetWeightKg,
        targetDate: null,
        weightUnit,
      },
    });
  }

  async markProfileCompleted(
    tx: Prisma.TransactionClient,
    userId: bigint,
  ): Promise<void> {
    await tx.user.update({
      where: { id: userId },
      data: { profileCompleted: true },
    });
  }
}
