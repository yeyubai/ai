import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateMealCheckinRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'INVALID_PARAMS' })
  checkinDate!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^(breakfast|lunch|dinner|snack)$/, { message: 'INVALID_PARAMS' })
  mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @IsString({ message: 'INVALID_PARAMS' })
  description!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'INVALID_PARAMS' })
  @Min(0, { message: 'INVALID_PARAMS' })
  @Max(5000, { message: 'INVALID_PARAMS' })
  estimatedKcal?: number;

  @IsOptional()
  @IsUrl({}, { message: 'INVALID_PARAMS' })
  imageUrl?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'INVALID_PARAMS' })
  isBackfill?: boolean;
}
