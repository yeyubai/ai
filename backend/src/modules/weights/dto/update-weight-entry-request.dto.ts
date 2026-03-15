import { IsDateString, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateWeightEntryRequestDto {
  @IsDateString()
  entryDate!: string;

  @IsDateString()
  measuredAt!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(300)
  weightKg!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  bodyFatPct?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
