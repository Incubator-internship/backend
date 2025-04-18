import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { AuthConfig } from '../../settings/auth.config';
import { Observable } from 'rxjs';

export const PostFileUploadInterceptor = FilesInterceptor('photos', 10, {
  storage: memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // limit 2mb per photo
    files: 10, // limit 10 photos
    fieldSize: 20 * 1024 * 1024, // limit 20mb for all photos
  },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(
        new BadRequestException({
          message: 'Only .jpg or .png files are allowed!',
          field: 'create post',
        }),
        false,
      );
    }
    return cb(null, true);
  },
});

// @Injectable()
// export class CustomFileInterceptor implements NestInterceptor {
//   private readonly fileInterceptor: any;
//
//   constructor(private readonly authConfig: AuthConfig) {
//     // Инициализируем FileInterceptor с настройками multer
//     console.log('authConfig ', authConfig);
//     this.fileInterceptor = FilesInterceptor(
//       'photos',
//       this.authConfig.maxFiles,
//       {
//         storage: memoryStorage(),
//         limits: {
//           fileSize: this.authConfig.maxFileSize, // Максимальный размер файла
//           files: this.authConfig.maxFiles, // Максимальное количество файлов
//           fieldSize: this.authConfig.maxFilesSize, // Общий размер файлов
//         },
//         fileFilter: (req, file, cb) => {
//           if (
//             ![
//               this.authConfig.photoJpegFormat,
//               this.authConfig.photoPngFormat,
//             ].includes(file.mimetype)
//           ) {
//             return cb(
//               new BadRequestException({
//                 message: 'Only .jpg or .png files are allowed!',
//                 field: 'create post',
//               }),
//               false,
//             );
//           }
//           return cb(null, true);
//         },
//       },
//     );
//   }
//
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     // Здесь вы можете добавлять дополнительные обработки или проверки, если необходимо
//     return this.fileInterceptor.intercept(context, next);
//   }
// }
