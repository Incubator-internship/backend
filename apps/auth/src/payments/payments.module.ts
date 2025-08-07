import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentsApiController } from './api/payments.api.controller';
import { PaymentsAuthService } from './application/payments.service';
import { AuthModule } from '../auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsEventsHandler } from './api/payments.events.handler';

@Module({
  imports: [
    CqrsModule,
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
    AuthModule,
  ],
  controllers: [PaymentsApiController, PaymentsEventsHandler],
  providers: [PaymentsAuthService],
  exports: [],
})
export class PaymentsApiModule {}
