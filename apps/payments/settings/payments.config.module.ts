import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsConfig } from './payments.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`,
        `.env.${process.env.NODE_ENV}`,
        'env.production',
      ],
      isGlobal: true,
    }),
  ],
  providers: [PaymentsConfig],
  exports: [PaymentsConfig],
})
export class PaymentsConfigModule {}
