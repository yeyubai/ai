import { IsString, Matches } from 'class-validator';

export class DeleteRequestDto {
  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^.{3,64}$/, { message: 'INVALID_PARAMS' })
  reason!: string;

  @IsString({ message: 'INVALID_PARAMS' })
  @Matches(/^DELETE$/, { message: 'INVALID_PARAMS' })
  confirmText!: string;
}
