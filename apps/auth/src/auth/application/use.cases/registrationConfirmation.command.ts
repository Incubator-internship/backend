import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';
import { EmailConfirmationRepository } from '../../../users/infrastructure/emailConfirmation.repository';

export class RegistrationConfirmationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationHandler
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute(command: RegistrationConfirmationCommand) {
    const emailConfirmationDTO =
      await this.emailConfirmationRepository.findEmailConfirmationByCode(
        command.code,
      );
    if (!emailConfirmationDTO) {
      return exceptionHandler(ResultCode.NotFound, 'user has`n found');
    }
    if (emailConfirmationDTO.expirationDate < new Date()) {
      return exceptionHandler(
        ResultCode.BadRequest,
        'Confirmation code has been expired',
      );
    }
    const changeEmailConfirmationStatus = {
      userId: emailConfirmationDTO.userId,
      code: command.code,
      emailConfirmationCode: 'null',
      isConfirmed: true,
    };
    await this.emailConfirmationRepository.changeEmailConfirmationStatus(
      changeEmailConfirmationStatus,
    );
    // return {
    //   status: statusType.Success,
    //   statusMessages: 'user has been confirmed',
    //   data: null,
    // };
  }
}
