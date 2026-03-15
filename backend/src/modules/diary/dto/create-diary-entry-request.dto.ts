import { IsString, MaxLength } from 'class-validator';

export class CreateDiaryEntryRequestDto {
  @IsString({ message: 'INVALID_PARAMS' })
  @MaxLength(200000, { message: 'INVALID_PARAMS' })
  contentHtml!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @MaxLength(50000, { message: 'INVALID_PARAMS' })
  plainText!: string;
}
