import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PostsModule } from './posts.module';

@Module({
  imports: [
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
  providers: [
    AppService,
    // {
    //   provide: 'CONFIG',
    //   useValue: config,
    // },
  ],
})
export class AppModule {}
