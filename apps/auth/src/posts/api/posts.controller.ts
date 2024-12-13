import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  CreatePostInputModel,
  PostModelDTO,
} from './models/input/posts-input.model';
import * as sharp from 'sharp';
import { JwtAccessAuthGuard } from '../../../guards/jwt/jwt-header.strategy';
import { TakeUserId } from '../../../decorators/authMeTakeUserId.decorator';
import { CreatePostCommand } from '../application/use.cases/createPost.command';

@ApiTags('Posts')
@UseGuards(ThrottlerGuard)
@Controller('posts')
export class PostsController {
  constructor(private commandBus: CommandBus) {}

  @Post('post')
  @UseGuards(JwtAccessAuthGuard)
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: diskStorage({
        destination: 'E:/BackEnd/backendIntership/photoForMyProject', // Путь для сохранения загруженных файлов
        filename: (req, file, callback) => {
          const uniqueFilename = `${randomUUID()}${extname(file.originalname)}`; // Генерация уникального имени файла
          callback(null, uniqueFilename);
        },
      }),
      limits: {
        fileSize: 2 * 1024 * 1024, // limit 2mb per photo
        files: 10, // limit 10 photos
        fieldSize: 20 * 1024 * 1024, // limit 20mb for all photos
      },
    }),
  )
  async createMultiplePost(
    @TakeUserId() { userId }: { userId: number },
    @Body() content: CreatePostInputModel,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    const photoUrls = [];
    for (const photo of photos) {
      const compressedFilename = `compressed-${photo.filename}`;
      await sharp(photo.path)
        .resize(800) // Изменяем размер до 800 пикселей по ширине
        .toFile(
          `E:/BackEnd/backendIntership/photoForMyProject/${compressedFilename}`,
        ); // Сохранение сжатого файла
      photoUrls.push(
        `E:/BackEnd/backendIntership/photoForMyProject/${compressedFilename}`,
      ); // Добавление URL в массив
    }
    const postDTO: PostModelDTO = { ...content, photoUrls, userId };
    return this.commandBus.execute(new CreatePostCommand(postDTO)); // Сохранение поста и фотографий в базе данных
  }
}
