import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthConfig } from '../settings/auth.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const authConfig = app.get<AuthConfig>(AuthConfig);

  await app.listen(authConfig.port);
  //todo delete console.log auth main
  console.log(`Auth microservice is running on ${authConfig.port} port`);
}
bootstrap();
