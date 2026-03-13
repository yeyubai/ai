import { Transform } from 'class-transformer';
import { IsDateOnly, IsTimezone } from 'src/shared/validation/decorators';

export class CreateAiReviewRequestDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsDateOnly({ message: 'INVALID_PARAMS' })
  date!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsTimezone({ message: 'INVALID_PARAMS' })
  timezone!: string;
}
