import { RegistrationInputUserModel } from '../../api/models/input/auth-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateUserCommand,
  CreateUserHandler,
} from '../../../users/application/use.cases/createUser.command';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../../../../mail/email-server.service';
import {
  UpdateUserCommand,
  UpdateUserHandler,
} from '../../../users/application/use.cases/updateUser.command';
import { BadRequestException } from '@nestjs/common';

export class RegistrationUserCommand {
  constructor(public readonly registrationDTO: RegistrationInputUserModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserHandler
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private createUserHandler: CreateUserHandler,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private updateUserHandler: UpdateUserHandler,
  ) {}

  async execute(command: RegistrationUserCommand): Promise<void> {
    //in findUserByLoginOrEmail include provider
    const existingUser = await this.usersRepository.findUserByLoginOrEmail(
      command.registrationDTO.email,
      command.registrationDTO.userName,
    );
    if (existingUser) {
      //Check does user have provider with type 'email'
      const emailProvider = existingUser.provider.find(
        (provider) => provider.providerType === 'email',
      );
      if (
        emailProvider &&
        command.registrationDTO.email === existingUser.email
      ) {
        throw new BadRequestException(
          'Registration user command found user by the same email',
        );
        // return exceptionHandler(
        //   ResultCode.Conflict,
        //   'This user already exist',
        //   'Registration user command found user by the same email',
        // );
      }
      if (
        emailProvider &&
        command.registrationDTO.userName === existingUser.userName
      ) {
        throw new BadRequestException(
          'Registration user command found user by the same userName',
        );
        // return exceptionHandler(
        //   ResultCode.Conflict,
        //   'This user already exist',
        //   'Registration user command found user by the same userName',
        // );
      }

      await this.updateUserHandler.execute(
        new UpdateUserCommand({
          email: command.registrationDTO.email,
          userName: command.registrationDTO.userName,
          password: command.registrationDTO.password,
        }),
      );
      return;
    }
    const data = await this.createUserHandler.execute(
      new CreateUserCommand(command.registrationDTO),
    );

    await this.emailService.sendUserConfirmationCode(
      command.registrationDTO.email,
      command.registrationDTO.userName,
      data.confirmationCode,
    );
  }
}
