import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { applyAppSettings } from '../settings/apply-app-setting';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyAppSettings(app);

  // Получение конфигурации через ConfigService
  const configService = app.get<ConfigService>(ConfigService); // Укажите тип

  // Получение порта из конфигурации
  const port = configService.get<number>('apiSettings.AUTH_PORT');
  console.log(port);
  //const port = appSettings.api.AUTH_PORT ?? 3000;
  // app.setGlobalPrefix('api/v1');
  //await app.listen(process.env.PORT ?? 3000);
  await app.listen(port);
}
bootstrap();
