import { IsNotEmpty, Matches } from 'class-validator';

export class LoginRequestDto {
  @Matches(/^1\d{10}$/, { message: 'INVALID_PARAMS' })
  phone!: string;

  @IsNotEmpty({ message: 'INVALID_PARAMS' })
  @Matches(/^\d{6}$/, { message: 'INVALID_PARAMS' })
  code!: string;
}
