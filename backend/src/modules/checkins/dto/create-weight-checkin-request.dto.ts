import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { IsDateOnly } from 'src/shared/validation/decorators';

export class CreateWeightCheckinRequestDto {
  @IsDateOnly({ message: 'INVALID_PARAMS' })
  checkinDate!: string;

  @IsDateString({}, { message: 'INVALID_PARAMS' })
  measuredAt!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'INVALID_PARAMS' })
  @Min(30, { message: 'INVALID_PARAMS' })
  @Max(250, { message: 'INVALID_PARAMS' })
  weightKg!: number;

  @IsIn(['manual', 'smart_scale'], { message: 'INVALID_PARAMS' })
  source!: 'manual' | 'smart_scale';

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'INVALID_PARAMS' })
  isBackfill?: boolean;
}
