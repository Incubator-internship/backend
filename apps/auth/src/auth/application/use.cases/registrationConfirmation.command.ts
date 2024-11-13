import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';

export class RegistrationConfirmationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationHandler
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: RegistrationConfirmationCommand) {
    const emailConfirmationDTO =
      await this.usersRepository.findEmailConfirmationByCode(command.code);
    if (!emailConfirmationDTO) {
      return exceptionHandler(ResultCode.NotFound, 'user has`n found');
    }
    const changeEmailConfirmationStatus = {
      userId: emailConfirmationDTO.userId,
      code: command.code,
      emailConfirmationCode: 'null',
      isConfirmed: true,
    };
    await this.usersRepository.changeEmailConfirmationStatus(
      changeEmailConfirmationStatus,
    );
    // return {
    //   status: statusType.Success,
    //   statusMessages: 'user has been confirmed',
    //   data: null,
    // };
  }
}
