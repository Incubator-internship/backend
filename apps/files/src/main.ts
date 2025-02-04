import { NestFactory } from '@nestjs/core';
import { FilesModule } from './files.module';
import { FilesConfig } from '../settings/files.config';

async function bootstrap() {
  const app = await NestFactory.create(FilesModule);

  const filesConfig = app.get<FilesConfig>(FilesConfig);
  //todo delete console.log files maine
  console.log('files port', filesConfig.port);
  await app.listen(filesConfig.port);
  console.log(`Files microservice is running on ${filesConfig.port} port`);
}
bootstrap();
