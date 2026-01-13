import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailService } from '../../../../mail/email-server.service';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';
import { EmailConfirmationRepository } from '../../../users/infrastructure/emailConfirmation.repository';

export class RegistrationEmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute(command: RegistrationEmailResendingCommand) {
    const user = await this.usersRepository.findUserAndEmailConfirmationByEmail(
      command.email,
    );
    if (!user) {
      return exceptionHandler(ResultCode.NotFound, 'user has`n found');
    }
    if (!user.emailConfirmation || user.emailConfirmation.isConfirmed) {
      return exceptionHandler(
        ResultCode.NotFound,
        'user has been already confirmed',
      );
    }

    const updateConfirmationCode = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), {
        days: 1,
        hours: 1,
        minutes: 1,
        seconds: 1,
      }),
      userId: user.id,
    };
    await this.emailConfirmationRepository.updateConfirmationCode(
      updateConfirmationCode,
    );
    await this.emailService.sendUserConfirmationCode(
      user.email,
      user.userName,
      updateConfirmationCode.confirmationCode,
    );
    // return {
    //   status: statusType.OK,
    //   statusMessages: 'registration code has been resending',
    //   data: null,
    // };
  }
}
