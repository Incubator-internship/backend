import { filesConfigModule } from '../settings/files-config';
import { Global, Module } from '@nestjs/common';
import { FilesController } from './api/files.controller';
import { FilesService } from './application/files.service';
import { FilesConfig } from '../settings/files.config';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    filesConfigModule,
    MongooseModule.forRootAsync({
      useFactory: (fileConfig: FilesConfig) => {
        return { uri: fileConfig.dataBaseMongoURL };
      },
      inject: [FilesConfig],
    }),
  ],
  controllers: [FilesController],
  providers: [FilesConfig, FilesService],
  exports: [FilesConfig],
})
export class FilesModule {}
