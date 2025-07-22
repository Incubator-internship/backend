import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentsApiController } from './api/payments.api.controller';
import { PaymentsAuthService } from './application/payments.service';
import { AuthModule } from '../auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsEventsHandler } from './api/payments.events.handler';
import { PaypalClientService } from './application/paypal.client.service';

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'PAYMENTS-SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3877,
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [PaymentsApiController, PaymentsEventsHandler],
  providers: [PaymentsAuthService, PaypalClientService],
  exports: [],
})
export class PaymentsApiModule {}
