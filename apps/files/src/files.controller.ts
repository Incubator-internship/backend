import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import * as sharp from 'sharp';

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
      console.error('No files uploaded');
      throw new BadRequestException('No files uploaded');
    }

    const fileUrls: string[] = [];
    for (const file of files) {
      const compressedFilename = `compressed-${randomUUID()}${extname(file.originalname)}`;
      const compressedPath = `E:/BackEnd/backendIntership/photoForMyProject/${compressedFilename}`;

      await sharp(file.buffer)
        .resize(800) // Сжимаем изображение до 800 пикселей по ширине
        .toFile(compressedPath);
      fileUrls.push(`/uploads/${compressedFilename}`);
    }
    return { urls: fileUrls };
  }
}
