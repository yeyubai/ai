import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';
import { JourneyStateService } from 'src/shared/state/journey-state.service';
import { DeleteStatusResponseDto } from '../dto/delete-status-response.dto';
import { ExportTaskResponseDto } from '../dto/export-task-response.dto';
import { SettingsResponseDto } from '../dto/settings-response.dto';
import { UpdateSettingsRequestDto } from '../dto/update-settings-request.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journeyState: JourneyStateService,
  ) {}

  async getSettings(userId: bigint): Promise<SettingsResponseDto> {
    const settings = await this.prisma.userSetting.findFirst({
      where: { userId, deletedAt: null },
      select: {
        weightUnit: true,
        timezone: true,
        locale: true,
      },
    });

    return {
      weightUnit: (settings?.weightUnit as SettingsResponseDto['weightUnit'] | undefined) ?? 'kg',
      timezone: settings?.timezone ?? 'Asia/Shanghai',
      locale: settings?.locale ?? 'zh-CN',
    };
  }

  async updateSettings(
    userId: bigint,
    payload: UpdateSettingsRequestDto,
  ): Promise<SettingsResponseDto> {
    await this.prisma.$transaction(async (tx) => {
      await tx.userSetting.upsert({
        where: { userId },
        update: {
          weightUnit: payload.weightUnit,
          timezone: payload.timezone,
          locale: payload.locale,
          deletedAt: null,
        },
        create: {
          userId,
          weightUnit: payload.weightUnit ?? 'kg',
          timezone: payload.timezone ?? 'Asia/Shanghai',
          locale: payload.locale ?? 'zh-CN',
        },
      });

      if (payload.weightUnit) {
        await tx.weightGoal.updateMany({
          where: { userId, deletedAt: null },
          data: { weightUnit: payload.weightUnit },
        });
      }
    });

    this.journeyState.updateSettings(userId, payload);
    return this.getSettings(userId);
  }

  createExport(userId: bigint, _format: string): ExportTaskResponseDto {
    const task = this.journeyState.createExportTask(userId);
    return {
      taskId: task.taskId,
      status: task.status,
    };
  }

  getExportTask(userId: bigint, taskId: string): ExportTaskResponseDto {
    const task = this.journeyState.getExportTask(userId, taskId);
    if (!task) {
      throw new NotFoundException('INVALID_PARAMS');
    }

    return {
      taskId: task.taskId,
      status: task.status,
      downloadUrl: task.downloadUrl,
      expiresAt: task.expiresAt,
    };
  }

  createDeleteRequest(userId: bigint, reason: string): DeleteStatusResponseDto {
    if (this.journeyState.getDeleteRequest(userId)) {
      throw new ConflictException({
        code: 'DUPLICATE_DELETE_REQUEST',
        message: 'DUPLICATE_DELETE_REQUEST',
      });
    }

    const request = this.journeyState.createDeleteRequest(userId, reason);
    return {
      status: request.status,
      requestedAt: request.requestedAt,
      effectiveAt: request.effectiveAt,
      canCancel: request.canCancel,
    };
  }

  getDeleteRequest(userId: bigint): DeleteStatusResponseDto {
    const request = this.journeyState.getDeleteRequest(userId);
    if (!request) {
      throw new NotFoundException('INVALID_PARAMS');
    }

    return {
      status: request.status,
      requestedAt: request.requestedAt,
      effectiveAt: request.effectiveAt,
      canCancel: request.canCancel,
    };
  }

  cancelDeleteRequest(userId: bigint) {
    const canceled = this.journeyState.cancelDeleteRequest(userId);
    return { canceled };
  }
}
