import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from '../settings/configuration';
import { applyAppSettings } from '../settings/apply-app-setting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyAppSettings(app);

  console.log('appSettings.api.AUTH_PORT', appSettings.api.AUTH_PORT);
  console.log('process.env.PORT', process.env.PORT);
  //app.setGlobalPrefix('api/v1');
  //const port = appSettings.api.AUTH_PORT ?? 3000;
  const port = appSettings.api.AUTH_PORT ?? process.env.PORT;
  //app.setGlobalPrefix('api/v1');
  //await app.listen(process.env.PORT ?? 3000);
  console.log('auth port', port);
  await app.listen(port);
  console.log(`Files microservice is running on ${port}`);
}
bootstrap();
