import { IsString, Matches } from 'class-validator';
import { IsDateOnly } from 'src/shared/validation/decorators';

export class ReviewSkipRequestDto {
  @IsDateOnly({ message: 'INVALID_PARAMS' })
  date!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  reason!: string;
}
