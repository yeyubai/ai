import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

export function IsTimezone(
  validationOptions: ValidationOptions = { message: 'INVALID_PARAMS' },
): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'IsTimezone',
      target: target.constructor,
      propertyName: propertyName.toString(),
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          const timezone = value.trim();
          if (timezone.length === 0) {
            return false;
          }

          try {
            new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage(_args: ValidationArguments): string {
          return 'INVALID_PARAMS';
        },
      },
    });
  };
}
