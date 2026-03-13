import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateProfileRequestDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'INVALID_PARAMS' })
  @Min(120, { message: 'INVALID_PARAMS' })
  @Max(220, { message: 'INVALID_PARAMS' })
  heightCm!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'INVALID_PARAMS' })
  @Min(30, { message: 'INVALID_PARAMS' })
  @Max(250, { message: 'INVALID_PARAMS' })
  currentWeightKg!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'INVALID_PARAMS' })
  @Min(30, { message: 'INVALID_PARAMS' })
  @Max(250, { message: 'INVALID_PARAMS' })
  targetWeightKg!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'INVALID_PARAMS' })
  @Min(4, { message: 'INVALID_PARAMS' })
  @Max(52, { message: 'INVALID_PARAMS' })
  goalWeeks?: number;

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  workRestPattern?: string;

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  dietPreference?: string;

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  activityBaseline?: string;

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,64}$/, { message: 'INVALID_PARAMS' })
  motivationPattern?: string;
}
