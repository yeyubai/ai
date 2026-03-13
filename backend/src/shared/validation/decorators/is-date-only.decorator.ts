import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { isValidDateOnly } from 'src/shared/utils/date.utils';

export function IsDateOnly(
  validationOptions: ValidationOptions = { message: 'INVALID_PARAMS' },
): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'IsDateOnly',
      target: target.constructor,
      propertyName: propertyName.toString(),
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && isValidDateOnly(value);
        },
        defaultMessage(_args: ValidationArguments): string {
          return 'INVALID_PARAMS';
        },
      },
    });
  };
}
