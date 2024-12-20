import { Module } from '@nestjs/common';
import { FilesController } from './api/files.controller';
import { FilesService } from './application/files.service';

@Module({
  imports: [],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
