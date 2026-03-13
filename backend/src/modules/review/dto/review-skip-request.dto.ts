import { IsString, Matches } from 'class-validator';

export class ReviewSkipRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'INVALID_PARAMS' })
  date!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  reason!: string;
}
