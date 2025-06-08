import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthConfig } from '../settings/auth.config';
import { applyAppSettings } from '../settings/apply-app-setting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyAppSettings(app);
  const authConfig = app.get<AuthConfig>(AuthConfig);
  await app.startAllMicroservices();
  await app.listen(authConfig.port);
  //todo delete console.log auth main
  console.log(`Auth microservice is running on ${authConfig.port} port`);
}
bootstrap();
