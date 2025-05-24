import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './application/payments.service';
import { PaymentsRepository } from './infrastructure/payments.repository';
import { PaymentsQueryRepository } from './infrastructure/payments-query.repository';
import { PrismaPaymentsService } from '../prisma-payments-database/prisma.service';
import { paymentsConfigModule } from '../settings/payments-config';
import { PaymentsConfig } from '../settings/payments.config';

@Module({
  imports: [paymentsConfigModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PrismaPaymentsService,
    PaymentsRepository,
    PaymentsQueryRepository,
    PaymentsConfig,
  ],
})
export class PaymentsModule {}
