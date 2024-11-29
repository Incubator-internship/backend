import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../src/users/infrastructure/users.repository';
import { EmailConfirmationRepository } from '../src/users/infrastructure/emailConfirmation.repository';

export function ConfirmationCodeIsValid(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: ConfirmationCodeIsValidConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'ConfirmationCodeIsValid', async: true })
@Injectable()
export class ConfirmationCodeIsValidConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async validate(value: any, validationArguments?: ValidationArguments) {
    const emailConfirmationDTO =
      await this.emailConfirmationRepository.findEmailConfirmationByCode(value);
    if (!emailConfirmationDTO) {
      return false;
    }
    if (emailConfirmationDTO.expirationDate < new Date()) {
      return false;
    }
    if (emailConfirmationDTO.isConfirmed) {
      return false;
    }
    return true;
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Code is not valid or code has been expired';
  }
}
