import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../infrastructure/users-query.repository';
import { ApiTags } from '@nestjs/swagger';
import { EditProfileTypes } from './models/input/edit-profile.types';
import { EditProfileCommand } from '../application/use.cases/updateProfile.command';
import { JwtAccessAuthGuard } from '../../../guards/jwt/jwt-header.strategy';
import { ProfileOwnerGuard } from '../guards/profile.owner.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TakeUserId } from '../../../decorators/authMeTakeUserId.decorator';
import { HttpService } from '@nestjs/axios';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import {
  UploadProfileAvatarCommand,
  UploadProfileAvatarHandler,
} from '../application/use.cases/uploadProfileAvatar.command';

@ApiTags('Endpoints for development')
@Controller('users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private userQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getAllUsers() {
    return await this.userQueryRepository.getAllUsers();
  }

  @UseGuards(JwtAccessAuthGuard, ProfileOwnerGuard)
  @Put('profile/:id')
  async editProfile(
    @Param('id', ParseIntPipe) profileId: number,
    @Body() editProfileDTO: EditProfileTypes,
  ) {
    await this.commandBus.execute(
      new EditProfileCommand({ ...editProfileDTO, profileId }),
    );
    return editProfileDTO;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(201)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (req, file, cb) => {
        console.log('file UseInterceptors', file);
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
          return cb(
            new BadRequestException('Only .jpg or .png files allowed!'),
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
    //transfer logic to command
    //**************************
    // console.log('controller avatar', avatar);
    // if (!avatar) {
    //   throw new BadRequestException('At least one photo is required.');
    // }
    //
    // console.log('avatar', avatar);
    // const uniqueFilename = `${randomUUID()}.${avatar.mimetype.split('/')[1]}`;
    // console.log('uniqueFilename', uniqueFilename);
    //--------------------Logic for download to PC--------------------------------
    // // Создаем путь к папке "uploads" на рабочем столе
    // const desktopPath = path.join('G:\\UploadAva');

    // // Проверяем, существует ли папка, если нет — создаем её
    // if (!fs.existsSync(desktopPath)) {
    //   fs.mkdirSync(desktopPath, { recursive: true });
    // }

    // // Полный путь к файлу
    // const filePath = path.join(desktopPath, uniqueFilename);

    // console.log('file.buffer ', avatar.buffer);
    //
    // // Сохраняем файл на диск
    // fs.writeFileSync(filePath, avatar.buffer);
    //
    // console.log(`Файл сохранен: ${filePath}`);
    // return { avatarUrl: `file://${filePath}` }; // Возвращаем локальный путь
    //----------------------------------------------------------------------------
    //transfer logic to command
    //**************************
    // const formData = new FormData();
    // formData.append('file', avatar.buffer, {
    //   filename: uniqueFilename,
    //   contentType: avatar.mimetype,
    // });
    // formData.append('userId', userId.toString());
    // console.log('formData ', formData);
    // const response = await firstValueFrom(
    //   this.httpService.post(
    //     'http://localhost:5001/api/v1/file/avatar-file',
    //     //'https://files.excubator.xyz:443/api/v1/file/avatar-files',
    //     formData,
    //     { headers: { ...formData.getHeaders() } },
    //   ),
    // );
    // console.log('response ', response);
    // return { avatarUrl: response.data.avatarUrl };
  }
}
