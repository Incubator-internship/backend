import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 3877,
      },
    },
  );
  await app.listen();
  console.log('🎯 payments microservice started');
}
bootstrap();
