import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCoachMessageRequestDto {
  @IsString({ message: 'INVALID_PARAMS' })
  @MinLength(1, { message: 'INVALID_PARAMS' })
  @MaxLength(1000, { message: 'INVALID_PARAMS' })
  content!: string;
}
