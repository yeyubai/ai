import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateActivityCheckinRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'INVALID_PARAMS' })
  checkinDate!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  activityType!: string;

  @Type(() => Number)
  @IsInt({ message: 'INVALID_PARAMS' })
  @Min(1, { message: 'INVALID_PARAMS' })
  @Max(600, { message: 'INVALID_PARAMS' })
  durationMin!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'INVALID_PARAMS' })
  @Min(0, { message: 'INVALID_PARAMS' })
  @Max(100000, { message: 'INVALID_PARAMS' })
  steps?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'INVALID_PARAMS' })
  @Min(0, { message: 'INVALID_PARAMS' })
  @Max(5000, { message: 'INVALID_PARAMS' })
  estimatedKcal?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'INVALID_PARAMS' })
  isBackfill?: boolean;
}
