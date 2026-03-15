import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserSettingsRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  diaryName?: string;

  @IsOptional()
  @IsIn(['aqua-mist', 'sea-breeze', 'paper-light'])
  theme?: 'aqua-mist' | 'sea-breeze' | 'paper-light';
}
