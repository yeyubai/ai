import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { IsTimezone } from 'src/shared/validation/decorators';

export class UpdateSettingsRequestDto {
  @IsOptional()
  @IsIn(['kg', 'lb'], { message: 'INVALID_PARAMS' })
  weightUnit?: 'kg' | 'lb';

  @IsOptional()
  @IsTimezone({ message: 'INVALID_PARAMS' })
  timezone?: string;

  @IsOptional()
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{2,16}$/, { message: 'INVALID_PARAMS' })
  locale?: string;
}
