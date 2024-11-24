import { RegistrationInputUserModel } from '../../api/models/input/auth-input.model';
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
  constructor(public readonly registrationDTO: RegistrationInputUserModel) {}
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
    const userByEmail = await this.userRepository.findUserByLoginOrEmail(
      command.registrationDTO.email,
    );
    if (userByEmail) {
      return exceptionHandler(
        ResultCode.Conflict,
        'This user already exist',
        'Registration user command found user by email',
      );
    }
    const userByUser = await this.userRepository.findUserByLoginOrEmail(
      command.registrationDTO.userName,
    );
    if (userByUser) {
      return exceptionHandler(
        ResultCode.Conflict,
        'This user already exist',
        'Registration user command found user by userName',
      );
    }
    const data = await this.createUserHandler.execute(
      new CreateUserCommand(command.registrationDTO),
    );
    //todo DONE but need uncoment
    await this.emailService.sendUserConfirmationCode(
      command.registrationDTO.email,
      command.registrationDTO.userName,
      data.confirmationCode,
    );
  }
}
