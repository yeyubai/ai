import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class OnboardingAssessmentRequestDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'INVALID_PARAMS' })
  @Min(4, { message: 'INVALID_PARAMS' })
  @Max(52, { message: 'INVALID_PARAMS' })
  goalWeeks!: number;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  workRestPattern!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  activityBaseline!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,64}$/, { message: 'INVALID_PARAMS' })
  motivationPattern!: string;

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  dietPreference?: string;
}
