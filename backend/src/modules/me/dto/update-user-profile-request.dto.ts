import { IsIn, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class UpdateUserProfileRequestDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(260)
  heightCm?: number;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  sex?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
