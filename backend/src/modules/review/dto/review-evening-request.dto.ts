import { IsString, Matches } from 'class-validator';
import { IsDateOnly, IsTimezone } from 'src/shared/validation/decorators';

export class ReviewEveningRequestDto {
  @IsDateOnly({ message: 'INVALID_PARAMS' })
  date!: string;

  @IsTimezone({ message: 'INVALID_PARAMS' })
  timezone!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  triggerSource!: string;
}
