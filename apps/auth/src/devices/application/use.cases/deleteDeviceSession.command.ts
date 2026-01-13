import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';

export class DeleteDeviceSessionCommand {
  constructor(
    public readonly userId: number,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceSessionCommand)
export class DeleteDeviceSessionHandler
  implements ICommandHandler<DeleteDeviceSessionCommand>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(command: DeleteDeviceSessionCommand): Promise<void> {
    const deviceSessionByDeviceId =
      await this.sessionsRepository.findSessionByDeviceId(command.deviceId);
    if (!deviceSessionByDeviceId) {
      return exceptionHandler(
        ResultCode.NotFound,
        'DeviceSession has been not found',
      );
    }

    if (command.userId != deviceSessionByDeviceId.userId) {
      return exceptionHandler(
        ResultCode.Forbidden,
        'Is not your deviceSession',
      );
    }
    await this.sessionsRepository.deleteSession(
      command.userId,
      command.deviceId,
    );
    // return {
    //   status: statusType.OK,
    //   statusMessages: 'DeviceSession has been deleted successfully',
    //   data: null,
    // };
  }
}
