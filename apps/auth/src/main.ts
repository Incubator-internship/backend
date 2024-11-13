import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { appSettings } from '../settings/configuration';
import { applyAppSettings } from '../settings/apply-app-setting';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

const port = appSettings.api.AUTH_PORT ?? 5000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyAppSettings(app);

  console.log('process.env.PORT', appSettings.api.AUTH_PORT);
  //app.setGlobalPrefix('api/v1');
  //await app.listen(process.env.PORT ?? 3000);
  console.log('post', port);
  await app.listen(port);
}
bootstrap();
