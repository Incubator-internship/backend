import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './infrastructure/payments.repository';
import { PaymentsQueryRepository } from './infrastructure/payments-query.repository';
import { PrismaPaymentsService } from '../prisma-payments-database/prisma.service';
import { PaymentsConfig } from '../settings/payments.config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentsYooService } from './api/payments.yoo.service';
import { PaymentsConfigModule } from '../settings/payments.config.module';
import { PaymentsPaypalService } from './api/payments.payPal.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PaymentsConfigModule,
    ScheduleModule.forRoot(),
    HttpModule.register({
      timeout: 5000, // Таймаут для запросов
      maxRedirects: 5,
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [PaymentsConfigModule],
        inject: [PaymentsConfig],
        useFactory: (paymentsConfig: PaymentsConfig) => ({
          transport: Transport.RMQ,
          options: {
            urls: [paymentsConfig.rabbitURL],
            queue: 'auth_queue',
            queueOptions: {
              durable: true,
              noAck: true,
              prefetchCount: 1,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsPaypalService,
    PaymentsYooService,
    PrismaPaymentsService,
    PaymentsRepository,
    PaymentsQueryRepository,
  ],
})
export class PaymentsModule {}
