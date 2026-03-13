import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateProfileRequestDto {
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'INVALID_PARAMS' },
  )
  @Min(120, { message: 'INVALID_PARAMS' })
  @Max(220, { message: 'INVALID_PARAMS' })
  heightCm!: number;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'INVALID_PARAMS' },
  )
  @Min(30, { message: 'INVALID_PARAMS' })
  @Max(250, { message: 'INVALID_PARAMS' })
  currentWeightKg!: number;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'INVALID_PARAMS' },
  )
  @Min(30, { message: 'INVALID_PARAMS' })
  @Max(250, { message: 'INVALID_PARAMS' })
  targetWeightKg!: number;
}
