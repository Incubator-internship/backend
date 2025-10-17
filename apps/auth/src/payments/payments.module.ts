import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentsApiController } from './api/payments.api.controller';
import { PaymentsAuthService } from './application/payments.service';
import { AuthModule } from '../auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsEventsHandler } from './api/payments.events.handler';
import { PaymentsNotification } from './application/payments.notification';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { PrismaService } from 'apps/auth/prisma/prisma.service';
import { AuthConfig } from 'apps/auth/settings/auth.config';
import { SessionsRepository } from '../devices/infrastructure/sessions.repository';

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
  providers: [
    PaymentsAuthService,
    PaymentsNotification,
    JwtService,
    UsersRepository,
    PrismaService,
    AuthConfig,
    SessionsRepository,
  ],
  exports: [],
})
export class PaymentsApiModule {}
