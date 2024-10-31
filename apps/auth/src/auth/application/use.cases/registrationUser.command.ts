import { RegistrationUserModel } from '../../api/models/input/auth-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateUserCommand,
  CreateUserHandler,
} from '../../../users/application/use.cases/createUser.command';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';
import { EmailService } from '../../../../mail/email-server.service';

export class RegistrationUserCommand {
  constructor(public readonly registrationDTO: RegistrationUserModel) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserHandler
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private createUserHandler: CreateUserHandler,
    private userRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: RegistrationUserCommand): Promise<void> {
    //todo we need remember that oath2 more logic about user
    const user = await this.userRepository.findUserByEmail(
      command.registrationDTO.email,
    );
    if (user) {
      return exceptionHandler(
        ResultCode.Conflict,
        'this user by exist',
        'Registration user command found user by email',
      );
    }
    const data = await this.createUserHandler.execute(
      new CreateUserCommand(command.registrationDTO),
    );
    //todo DONE but need uncoment
    // await this.emailService.sendUserConfirmationCode(
    //   command.registrationDTO.email,
    //   command.registrationDTO.userName,
    //   data.confirmationCode,
    // );
  }
}
