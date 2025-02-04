import { BadRequestException, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as sharp from 'sharp';
import { FilesConfig } from '../../settings/files.config';

@Injectable()
export class FilesService {
  private s3: S3;
  private bucketName: string;
  constructor(private filesConfig: FilesConfig) {
    this.s3 = new S3({
      accessKeyId: this.filesConfig.s3AccessKeyId,
      secretAccessKey: this.filesConfig.s3SecretAccessKey,
      region: this.filesConfig.s3Region,
    });
    this.bucketName = this.filesConfig.s3BucketName;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    // Сжатие файла с помощью Sharp
    const compressedBuffer = await sharp(file.buffer)
      .resize(800) // Сжимаем изображение до 800 пикселей по ширине
      .toBuffer();

    // Уникальное имя файла
    const uniqueFilename = `compressed-${Date.now()}-${file.originalname}`;

    // Параметры для загрузки в S3
    const params = {
      Bucket: this.bucketName,
      Key: uniqueFilename,
      Body: compressedBuffer,
      ContentType: file.mimetype,
    };

    try {
      const result = await this.s3.upload(params).promise();
      return result.Location; // Возвращаем URL загруженного файла
    } catch (error) {
      console.error('Ошибка при загрузке в S3:', error);
      throw new BadRequestException('Ошибка при загрузке файла');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
