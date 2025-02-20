import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { EditProfileDTOModel } from '../../../posts/api/models/dto-models/edit-profile-dto.model';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { DateHelper } from '../../../../common/helpers/date.helpers';
import { AuthConfig } from '../../../../settings/auth.config';

export class EditProfileCommand {
  constructor(public readonly editProfileDTO: EditProfileDTOModel) {}
}

@CommandHandler(EditProfileCommand)
export class EditProfileHandler implements ICommandHandler<EditProfileCommand> {
  constructor(
    private profileRepository: ProfileRepository,
    private userRepository: UsersRepository,
    private authConfig: AuthConfig,
  ) {}

  async execute(command: EditProfileCommand): Promise<void> {
    const {
      userName,
      firstName,
      lastName,
      dateOfBirthday,
      country,
      city,
      aboutMe,
      profileId,
    } = command.editProfileDTO;

    //find user by profileID (because this is same value)
    const user: User = await this.userRepository.getUserById(profileId);

    if (!user) {
      throw new NotFoundException('user not found');
    }
    console.log('user by postId', user);

    let parsedDateOfBirth;

    //if received dateOfBirthday
    if (dateOfBirthday) {
      const { parsedDate } = DateHelper.getDate({ date: dateOfBirthday });

      //check maxAge no more >100
      const maxAge = DateHelper.checkMaxDate({
        date: parsedDate,
        years: this.authConfig.maxAge,
      });

      if (!maxAge) {
        throw new BadRequestException(
          'The user`s age cannot be more than 100 years old',
        );
      }

      //check minAge no less >100
      const minAge = DateHelper.checkMinDate({
        date: parsedDate,
        years: this.authConfig.minAge,
      });

      if (!minAge) {
        throw new BadRequestException(
          'The user`s age cannot be less than 13 years old',
        );
      }
      parsedDateOfBirth = parsedDate;
    }

    //check the userName if it is different,then it needs to be changed via userRepo
    if (user.userName !== userName) {
      const uniqUser =
        await this.userRepository.findUniqueUserByUserName(userName);
      console.log('uniqUser', uniqUser);
      if (uniqUser) {
        throw new BadRequestException('User with this user name already exist');
      }
      await this.userRepository.editUserName(profileId, userName);
    }
    return;
  }
}
