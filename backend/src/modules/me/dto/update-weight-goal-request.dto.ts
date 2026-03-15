import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateWeightGoalRequestDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(300)
  startWeightKg!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(300)
  targetWeightKg!: number;

  @IsOptional()
  @IsString()
  targetDate?: string;

  @IsIn(['kg', 'lb'])
  weightUnit!: 'kg' | 'lb';
}
