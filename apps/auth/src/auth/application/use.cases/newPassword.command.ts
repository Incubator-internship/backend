import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';
import { InputNewPasswordModel } from '../../api/models/input/auth-input.model';
import { PasswordRecoveryRepository } from '../../infrastructure/passwordRecovery.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';

export class NewPasswordCommand {
  constructor(public readonly newPasswordModel: InputNewPasswordModel) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordHandler implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: NewPasswordCommand) {
    const recoveryDTO =
      await this.passwordRecoveryRepository.findRecoveryCodeByCode(
        command.newPasswordModel.recoveryCode,
      );
    if (!recoveryDTO) {
      return exceptionHandler(
        ResultCode.NotFound,
        'Recovery code has been not valid',
      );
    }
    if (recoveryDTO.alreadyChangePassword) {
      return exceptionHandler(
        ResultCode.BadRequest,
        'Recovery code has been used already',
      );
    }
    if (recoveryDTO.recoveryCodeExpireDate < new Date()) {
      return exceptionHandler(
        ResultCode.BadRequest,
        'Recovery code has been expired',
      );
    }
    await this.changePassword(
      recoveryDTO.userId,
      command.newPasswordModel.newPassword,
    );
    // return {
    //   status: statusType.OK,
    //   statusMessages: 'Password has been changed',
    //   data: null,
    // };
  }
  private async changePassword(userId: number, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.changePassword(userId, passwordHash);
  }
}
