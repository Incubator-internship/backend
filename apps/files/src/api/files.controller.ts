import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from '../application/files.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('file')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  getHello(): string {
    return this.filesService.getHello();
  }

  @Post('post-files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    console.log('files in files', files);
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const fileUrls: string[] = [];
    for (const file of files) {
      // const compressedFilename = `compressed-${randomUUID()}${extname(file.originalname)}`;
      // const compressedPath = `E:/BackEnd/backendIntership/photoForMyProject/${compressedFilename}`;
      //
      // await sharp(file.buffer)
      //   .resize(800) // Сжимаем изображение до 800 пикселей по ширине
      //   .toFile(compressedPath);
      //fileUrls.push(`/uploads/${compressedFilename}`);

      // Using the service to upload a file to S3 and compress a photo
      const fileUrl = await this.filesService.uploadFile(file, 800);
      fileUrls.push(fileUrl);
    }
    return { urls: fileUrls };
  }

  @Post('avatar-file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
  ) {
    if (!file) {
      console.error('No files uploaded');
      throw new BadRequestException('No files uploaded');
    }
    const originalAvatarUrl = await this.filesService.uploadFile(file, 800);
    const smallAvatarUrl = await this.filesService.uploadFile(file, 400);
    //console.log(avatarUrl);
    //return { avatarUrl };
    return { originalAvatarUrl, smallAvatarUrl };
  }
}
