import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentsApiController } from './api/payments.api.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PAYMENTS-SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'payments-backend-service',
          port: 3877,
        },
      },
    ]),
  ],
  controllers: [PaymentsApiController],
  providers: [],
  exports: [],
})
export class PaymentsApiModule {}
