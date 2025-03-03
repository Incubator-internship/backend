import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { EditProfileTypes } from './models/input/edit-profile.types';
import { EditProfileCommand } from '../application/use.cases/updateProfile.command';
import { JwtAccessAuthGuard } from '../../../guards/jwt/jwt-header.strategy';
import { ProfileOwnerGuard } from '../guards/profile.owner.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TakeUserId } from '../../../decorators/authMeTakeUserId.decorator';

import { UploadProfileAvatarCommand } from '../application/use.cases/uploadProfileAvatar.command';
import {
  EditProfileEndpoint,
  UploadAvatarEndpoint,
} from '../../../swagger/users.swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private commandBus: CommandBus) {}

  @EditProfileEndpoint()
  @UseGuards(JwtAccessAuthGuard, ProfileOwnerGuard)
  @HttpCode(200)
  @Put('profile/:id')
  async editProfile(
    @Param('id', ParseIntPipe) profileId: number,
    @Body() editProfileDTO: EditProfileTypes,
  ) {
    await this.commandBus.execute(
      new EditProfileCommand({ ...editProfileDTO, profileId }),
    );
  }

  @UploadAvatarEndpoint()
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(201)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (req, file, cb) => {
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
          return cb(
            new BadRequestException([
              {
                message: 'Only .jpg or .png files allowed!',
                field: 'download avatar',
              },
            ]),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @TakeUserId() { userId }: { userId: number },
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    await this.commandBus.execute(
      new UploadProfileAvatarCommand(userId, avatar),
    );
  }
}
