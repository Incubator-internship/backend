import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('rocess.env.PORT', process.env.PORT)
  app.setGlobalPrefix('/api/v1')
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
