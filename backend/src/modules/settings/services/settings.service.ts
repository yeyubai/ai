import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JourneyStateService } from 'src/shared/state/journey-state.service';
import { DeleteStatusResponseDto } from '../dto/delete-status-response.dto';
import { ExportTaskResponseDto } from '../dto/export-task-response.dto';
import { SettingsResponseDto } from '../dto/settings-response.dto';
import { UpdateSettingsRequestDto } from '../dto/update-settings-request.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly journeyState: JourneyStateService) {}

  getSettings(userId: bigint): SettingsResponseDto {
    return this.journeyState.getSettings(userId);
  }

  updateSettings(userId: bigint, payload: UpdateSettingsRequestDto): SettingsResponseDto {
    return this.journeyState.updateSettings(userId, payload);
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

