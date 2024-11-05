import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../src/users/infrastructure/users.repository';

@ValidatorConstraint({ async: true })
export class EmailIsNotExistConstraint implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

  async validate(email: string, args: ValidationArguments) {
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user) return false;
    return true;
  }
}

export function EmailIsNotExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailIsNotExistConstraint,
    });
  };
}
