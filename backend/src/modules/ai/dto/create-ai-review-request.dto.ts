import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class CreateAiReviewRequestDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  timezone!: string;
}
