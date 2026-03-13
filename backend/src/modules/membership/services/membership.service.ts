import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { JourneyStateService } from 'src/shared/state/journey-state.service';
import { getTodayInTimezone } from 'src/shared/utils/date.utils';
import { MembershipStatusResponseDto } from '../dto/membership-status-response.dto';
import { ReminderReceiptsResponseDto } from '../dto/reminder-receipts-response.dto';
import { ReminderSettingsRequestDto } from '../dto/reminder-settings-request.dto';
import { ReminderSettingsResponseDto } from '../dto/reminder-settings-response.dto';

@Injectable()
export class MembershipService {
  constructor(private readonly journeyState: JourneyStateService) {}

  getStatus(userId: bigint): MembershipStatusResponseDto {
    return this.journeyState.getMembershipStatus(userId);
  }

  getReminderSettings(userId: bigint): ReminderSettingsResponseDto {
    return this.journeyState.getReminderSettings(userId);
  }

  updateReminderSettings(
    userId: bigint,
    payload: ReminderSettingsRequestDto,
  ): ReminderSettingsResponseDto {
    const membership = this.journeyState.getMembershipStatus(userId);
    if (payload.strongReminderEnabled && !membership.entitlements.strongReminder) {
      throw new ForbiddenException({
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'SUBSCRIPTION_REQUIRED',
      });
    }

    const quiet = payload.quietHours;
    const allTimes = [...payload.dailyMissionReminderTimes, payload.reviewReminderTime];
    if (allTimes.some((item) => this.isWithinQuietHours(item, quiet.start, quiet.end))) {
      throw new ConflictException({
        code: 'REMINDER_WINDOW_CONFLICT',
        message: 'REMINDER_WINDOW_CONFLICT',
      });
    }

    return this.journeyState.updateReminderSettings(userId, payload);
  }

  getReminderReceipts(userId: bigint): ReminderReceiptsResponseDto {
    const settings = this.journeyState.getReminderSettings(userId);
    const today = getTodayInTimezone();
    const list = settings.dailyMissionReminderTimes.slice(0, 2).map((time, index) => ({
      reminderType: index === 0 ? 'daily_mission' : 'review',
      scheduledAt: `${today}T${time}:00+08:00`,
      sentAt: `${today}T${time}:02+08:00`,
      status: 'sent' as const,
      openAt: `${today}T${time}:10+08:00`,
    }));

    return {
      list,
      total: list.length,
    };
  }

  private isWithinQuietHours(time: string, start: string, end: string): boolean {
    const toMinutes = (value: string) => {
      const [hour, minute] = value.split(':').map(Number);
      return hour * 60 + minute;
    };

    const current = toMinutes(time);
    const startValue = toMinutes(start);
    const endValue = toMinutes(end);

    if (startValue < endValue) {
      return current >= startValue && current <= endValue;
    }

    return current >= startValue || current <= endValue;
  }
}
