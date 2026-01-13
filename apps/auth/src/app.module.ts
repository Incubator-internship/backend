// import of this config 'configModule' module must be on the top of imports
import { configModule } from '../settings/auth-config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PostsModule } from './posts/posts.module';
import { PaymentsApiModule } from './payments/payments.module';

@Module({
  imports: [
    configModule,
    AuthModule,
    PostsModule,
    PaymentsApiModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
