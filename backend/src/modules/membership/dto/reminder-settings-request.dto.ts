import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsString, Matches, ValidateNested } from 'class-validator';

class QuietHoursDto {
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'INVALID_PARAMS' })
  start!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'INVALID_PARAMS' })
  end!: string;
}

export class ReminderSettingsRequestDto {
  @IsArray({ message: 'INVALID_PARAMS' })
  @IsString({ each: true, message: 'INVALID_PARAMS' })
  dailyMissionReminderTimes!: string[];

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'INVALID_PARAMS' })
  reviewReminderTime!: string;

  @IsBoolean({ message: 'INVALID_PARAMS' })
  strongReminderEnabled!: boolean;

  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours!: QuietHoursDto;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,64}$/, { message: 'INVALID_PARAMS' })
  timezone!: string;
}
