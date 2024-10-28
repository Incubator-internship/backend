import { RegistrationUserModel } from '../../api/models/input/auth-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateUserCommand,
  CreateUserHandler,
} from '../../../users/application/use.cases/createUser.command';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  exceptionHandler,
  ExceptionResultType,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';

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
  ) {}
  async execute(command: RegistrationUserCommand): Promise<void> {
    //todo check that user already exist
    const user = this.userRepository.findUserByEmail(
      command.registrationDTO.email,
    );
    if (user) {
      //throw new NotFoundException();
      return exceptionHandler(
        ResultCode.Conflict,
        'this user by exist',
        'registraton user comman find user by email',
      );
      // return {
      //   data: false,
      //   code: ResultCode.NotFound,
      //   field: 'registraton user comman find user by email',
      //   message: 'this user by exist',
      // };
    }
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
