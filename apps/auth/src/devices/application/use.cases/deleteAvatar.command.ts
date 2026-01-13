import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '../../../users/infrastructure/profile.repository';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';

export class DeleteAvatarCommand {
  constructor(
    public readonly profileId: number,
    public readonly userId: number,
  ) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarHandler
  implements ICommandHandler<DeleteAvatarCommand>
{
  constructor(private profileRepository: ProfileRepository) {}

  async execute(command: DeleteAvatarCommand) {
    const profile = await this.profileRepository.getProfileById(
      command.profileId,
    );
    if (!profile) {
      return exceptionHandler(
        ResultCode.NotFound,
        'Profile does not exist',
        'delete avatar',
      );
    }
    if (profile.profileId !== command.userId) {
      return exceptionHandler(
        ResultCode.Forbidden,
        'You do`t have permission to delete avatar.',
        'delete avatar',
      );
    }
    await this.profileRepository.deleteAvatar(command.profileId);
  }
}
