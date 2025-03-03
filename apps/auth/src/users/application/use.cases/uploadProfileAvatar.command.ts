import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { BadRequestException } from '@nestjs/common';
import { AuthConfig } from '../../../../settings/auth.config';
import { randomUUID } from 'crypto';
import * as FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';

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
    private authConfig: AuthConfig,
    private httpService: HttpService,
  ) {}

  async execute(command: UploadProfileAvatarCommand): Promise<void> {
    if (!command.avatar) {
      exceptionHandler(
        ResultCode.BadRequest,
        'At least one1 photo is required',
        'download avatar',
      );
      // throw new BadRequestException([
      //   { message: 'At least one1 photo is required.' },
      // ]);
    }
    const profile = await this.profileRepository.getProfileById(command.userId);

    if (!profile) {
      exceptionHandler(
        ResultCode.BadRequest,
        'Profile doesnt exist',
        'download avatar',
      );
      // throw new BadRequestException('Profile doesnt exist');
    }

    const uniqueFilename = `${randomUUID()}.${command.avatar.mimetype.split('/')[1]}`;

    const formData = new FormData();

    formData.append('file', command.avatar.buffer, {
      filename: uniqueFilename,
      contentType: command.avatar.mimetype,
    });
    formData.append('userId', command.userId.toString());

    const response = await firstValueFrom(
      this.httpService.post(
        this.authConfig.uploadAvatarFileMicroservice,
        //todo delete links below
        //'http://localhost:5001/api/v1/file/avatar-file',
        //'https://files.excubator.xyz:443/api/v1/file/avatar-files',
        formData,
        { headers: { ...formData.getHeaders() } },
      ),
    );
    console.log('command.avatar ', response.data.originalAvatarUrl);
    console.log('command.avatar ', response.data.smallAvatarUrl);
    await this.profileRepository.updateProfileAvatar(
      command.userId,
      response.data.originalAvatarUrl,
      response.data.smallAvatarUrl,
    );
    //return { avatarUrl: response.data.avatarUrl };
  }
}
