import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth-module';
import getConfig from '../settings/app-settings-modul';
import { ConfigModule } from '@nestjs/config';
//import * as process from 'process';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig], // Load your custom configuration
      // envFilePath: [`.env.${process.env.NODE_ENV}`],
      isGlobal: true, // Make the config globally available
    }),
    AuthModule,
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
