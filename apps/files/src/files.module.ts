import { filesConfigModule } from '../settings/files-config';
import { Module } from '@nestjs/common';
import { FilesController } from './api/files.controller';
import { FilesService } from './application/files.service';
import { FilesConfig } from '../settings/files.config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from './core.module';

@Module({
  imports: [
    filesConfigModule,
    MongooseModule.forRootAsync({
      useFactory: (fileConfig: FilesConfig) => {
        console.log('mongoURL', fileConfig.dataBaseMongoURL);
        return { uri: fileConfig.dataBaseMongoURL };
      },
      inject: [FilesConfig],
    }),
    CoreModule,
  ],
  controllers: [FilesController],
  //providers: [FilesConfig, FilesService],
  providers: [FilesService],
  //exports: [FilesConfig],
})
export class FilesModule {}
