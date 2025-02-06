import { NestFactory } from '@nestjs/core';
import { FilesModule } from './files.module';
import { FilesConfig } from '../settings/files.config';
import { applyAppFileSettings } from '../settings/apply-app-file-setting';

async function bootstrap() {
  const app = await NestFactory.create(FilesModule);
  applyAppFileSettings(app);
  const filesConfig = app.get<FilesConfig>(FilesConfig);
  //todo delete console.log files maine
  console.log('files port', filesConfig.port);
  await app.listen(filesConfig.port);
  console.log(`Files microservice is running on ${filesConfig.port} port`);
}
bootstrap();
