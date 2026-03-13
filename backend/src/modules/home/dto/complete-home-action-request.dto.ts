import { IsDateString, IsString, Matches } from 'class-validator';

export class CompleteHomeActionRequestDto {
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,32}$/, { message: 'INVALID_PARAMS' })
  source!: string;

  @IsDateString({}, { message: 'INVALID_PARAMS' })
  completedAt!: string;
}
