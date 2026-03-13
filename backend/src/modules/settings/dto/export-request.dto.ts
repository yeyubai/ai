import { IsString, Matches } from 'class-validator';

export class ExportRequestDto {
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^(json|csv)$/, { message: 'INVALID_PARAMS' })
  format!: string;
}
