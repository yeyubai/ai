import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateSettingsRequestDto {
  @IsOptional()
  @IsIn(['kg', 'lb'], { message: 'INVALID_PARAMS' })
  weightUnit?: 'kg' | 'lb';

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,64}$/, { message: 'INVALID_PARAMS' })
  timezone?: string;

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{2,16}$/, { message: 'INVALID_PARAMS' })
  locale?: string;
}
