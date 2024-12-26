import { NestFactory } from '@nestjs/core';
import { FilesModule } from './files.module';
import { applyAppFileSettings } from '../settings/apply-app-file-setting';
import { filesSettings } from '../settings/file-configuration';

async function bootstrap() {
  const app = await NestFactory.create(FilesModule);
  applyAppFileSettings(app);

  console.log('appSettings.api.FILE_PORT', filesSettings.api.FILE_PORT);
  const port = filesSettings.api.FILE_PORT ?? process.env.PORT;

  console.log('file port', port);
  await app.listen(port ?? 3000);
  console.log(`Files microservice is running on ${port}`);
}
bootstrap();
