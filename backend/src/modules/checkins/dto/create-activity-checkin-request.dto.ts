import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { IsDateOnly } from 'src/shared/validation/decorators';

export class CreateActivityCheckinRequestDto {
  @IsDateOnly({ message: 'INVALID_PARAMS' })
  checkinDate!: string;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'INVALID_PARAMS' })
  completed!: boolean;

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  activityType?: string;

  @Type(() => Number)
  @IsInt({ message: 'INVALID_PARAMS' })
  @Min(0, { message: 'INVALID_PARAMS' })
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
