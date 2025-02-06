import { filesConfigModule } from '../settings/files-config';
import { Module } from '@nestjs/common';
import { FilesController } from './api/files.controller';
import { FilesService } from './application/files.service';
import { FilesConfig } from '../settings/files.config';

@Module({
  imports: [filesConfigModule],
  controllers: [FilesController],
  providers: [FilesConfig, FilesService],
})
export class FilesModule {}
