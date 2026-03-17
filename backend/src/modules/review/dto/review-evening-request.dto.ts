import { IsString, Matches } from 'class-validator';

export class ReviewEveningRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'INVALID_PARAMS' })
  date!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,64}$/, { message: 'INVALID_PARAMS' })
  timezone!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  triggerSource!: string;
}
