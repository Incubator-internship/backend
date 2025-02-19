import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EditProfileModel } from '../../api/models/input/edit-profile.model';
import { ProfileRepository } from '../../infrastructure/profile.repository';

export class EditProfileCommand {
  constructor(public readonly editProfileDTO: EditProfileModel) {}
}

@CommandHandler(EditProfileCommand)
export class EditProfileHandler implements ICommandHandler<EditProfileCommand> {
  constructor(private profileRepository: ProfileRepository) {}

  async execute(command: EditProfileCommand): Promise<void> {
    return;
  }
}
