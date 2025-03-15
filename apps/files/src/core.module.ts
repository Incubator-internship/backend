import { Global, Module } from '@nestjs/common';
import { FilesConfig } from '../settings/files.config';

@Global()
@Module({
  imports: [],
  providers: [FilesConfig],
  exports: [FilesConfig],
})
export class CoreModule {}
