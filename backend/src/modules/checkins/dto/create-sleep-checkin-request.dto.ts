import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { IsDateOnly } from 'src/shared/validation/decorators';

export class CreateSleepCheckinRequestDto {
  @IsDateOnly({ message: 'INVALID_PARAMS' })
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
