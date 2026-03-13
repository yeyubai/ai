import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateSleepCheckinRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'INVALID_PARAMS' })
  checkinDate!: string;

  @IsDateString({}, { message: 'INVALID_PARAMS' })
  sleepAt!: string;

  @IsDateString({}, { message: 'INVALID_PARAMS' })
  wakeAt!: string;

  @Type(() => Number)
  @IsInt({ message: 'INVALID_PARAMS' })
  @Min(1, { message: 'INVALID_PARAMS' })
  @Max(1440, { message: 'INVALID_PARAMS' })
  durationMin!: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'INVALID_PARAMS' })
  isBackfill?: boolean;
}
