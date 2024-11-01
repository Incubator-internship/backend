import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordRecoveryRepository } from '../../infrastructure/passwordRecovery.repository';
import { EmailService } from '../../../../mail/email-server.service';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';
import { PasswordRecoveryModel } from '../../domain/createPasswwordRecovery.model';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import log from 'eslint-plugin-react/lib/util/log';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    const user = await this.usersRepository.findUserByEmail(command.email);
    console.log('PasswordRecoveryCommand user ', user);
    if (!user) {
      return exceptionHandler(ResultCode.NotFound, 'user has`t been found');
    }
    const recoveryCode = randomUUID();
    const recoveryCodeExpireDate = add(new Date(), {
      hours: 3,
      minutes: 3,
      seconds: 3,
    });
    const passwordRecovery = PasswordRecoveryModel.createPasswordRecovery(
      user.id,
      recoveryCode,
      recoveryCodeExpireDate,
    );
    await this.passwordRecoveryRepository.createPasswordRecovery(
      passwordRecovery,
    );
    await this.emailService.sendPasswordRecoveryCode(
      user.email,
      user.userName,
      passwordRecovery.recoveryCode,
    );
    // return {
    //   status: statusType.OK,
    //   statusMessages: 'Password recovery code has been sand',
    //   data: null,
    // };
  }
}
