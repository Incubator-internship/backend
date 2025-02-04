import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { FilesController } from './api/files.controller';
import { FilesService } from './application/files.service';
import { FilesConfig } from '../settings/files.config';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [FilesConfig, FilesService],
})
export class FilesModule {}
