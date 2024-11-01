import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../src/users/infrastructure/users.repository';

@ValidatorConstraint({ async: true })
export class EmailConfirmationExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}

  async validate(email: string, args: ValidationArguments) {
    const user = await this.usersRepository.findUserByEmail(email);
    console.log('IsNotEmailExistConstraint ', user);
    //todo user!.id а было user?.id
    if (!user) return false;
    const emailConfirmationDTO =
      await this.usersRepository.findEmailConfirmationByUserId(user.id);
    console.log('IsNotEmailExistConstraint ', emailConfirmationDTO);

    if (emailConfirmationDTO && !emailConfirmationDTO?.isConfirmed) {
      return true;
    }
    return false;
  }
}

export function EmailConfirmationExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailConfirmationExistConstraint,
    });
  };
}
