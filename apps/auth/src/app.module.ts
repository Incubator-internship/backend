// import of this config 'configModule' module must be on the top of imports
import { configModule } from '../settings/auth-config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PostsModule } from './posts.module';
import { AuthConfig } from '../settings/auth.config';

@Module({
  imports: [
    configModule,
    AuthModule,
    PostsModule,
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
