import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { DateHelper } from '../../../../common/helpers/date.helpers';
import { AuthConfig } from '../../../../settings/auth.config';
import { ProfileModel } from '../../domain/smartProfile.model';
import { EditProfileDTOModel } from '../../api/models/dto-models/edit-profile-dto.types';
import { randomUUID } from 'crypto';
import * as FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

export class UploadProfileAvatarCommand {
  constructor(
    public readonly userId: number,
    public readonly avatar: Express.Multer.File,
  ) {}
}

@CommandHandler(UploadProfileAvatarCommand)
export class UploadProfileAvatarHandler
  implements ICommandHandler<UploadProfileAvatarCommand>
{
  constructor(
    private profileRepository: ProfileRepository,
    private userRepository: UsersRepository,
    private authConfig: AuthConfig,
    private httpService: HttpService,
  ) {}

  async execute(command: UploadProfileAvatarCommand): Promise<void> {
    console.log('UploadProfileAvatarCommand ', command);

    console.log('controller avatar', command.avatar);
    if (!command.avatar) {
      throw new BadRequestException('At least one photo is required.');
    }

    const uniqueFilename = `${randomUUID()}.${command.avatar.mimetype.split('/')[1]}`;
    console.log('uniqueFilename', uniqueFilename);
    const formData = new FormData();
    formData.append('file', command.avatar.buffer, {
      filename: uniqueFilename,
      contentType: command.avatar.mimetype,
    });
    formData.append('userId', command.userId.toString());
    console.log('formData ', formData);
    const response = await firstValueFrom(
      this.httpService.post(
        'http://localhost:5001/api/v1/file/avatar-file',
        //'https://files.excubator.xyz:443/api/v1/file/avatar-files',
        formData,
        { headers: { ...formData.getHeaders() } },
      ),
    );
    console.log('response ', response);
    return { avatarUrl: response.data.avatarUrl };
  }
}
