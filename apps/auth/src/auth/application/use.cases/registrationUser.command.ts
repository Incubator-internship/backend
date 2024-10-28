import { RegistrationUserModel } from '../../api/models/input/auth-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateUserCommand,
  CreateUserHandler,
} from '../../../users/application/use.cases/createUser.command';

export class RegistrationUserCommand {
  constructor(public readonly registrationDTO: RegistrationUserModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserHandler
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(private createUserHandler: CreateUserHandler) {}
  async execute(command: RegistrationUserCommand) {
    //todo check that user already exist
    const data = await this.createUserHandler.execute(
      new CreateUserCommand(command.registrationDTO),
    );
    //todo
    // await this.emailService.sendUserConfirmationCode(
    //   command.registrationDTO.email,
    //   command.registrationDTO.login,
    //   emailConfirmationDTO!.confirmationCode,
    // );
  }
}
