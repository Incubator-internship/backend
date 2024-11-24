import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class FindSessionByUserIdAndDeviceIdCommand {
  constructor(
    public readonly userId: number,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(FindSessionByUserIdAndDeviceIdCommand)
export class FindSessionByUserIdAndDeviceIdHandler
  implements ICommandHandler<FindSessionByUserIdAndDeviceIdCommand>
{
  constructor(private sessionRepository: SessionsRepository) {}

  async execute(command: FindSessionByUserIdAndDeviceIdCommand) {
    console.log('FindSessionByUserIdAndDeviceIdCommand');
    console.log(command.userId, command.deviceId);
    console.log(typeof command.userId, 'userID');
    return this.sessionRepository.findSessionByUserIdAndDeviceId(
      command.userId,
      command.deviceId,
    );
  }
}
