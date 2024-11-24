import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email-server.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
          user: 'maksymdeveloper88@gmail.com',
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: 'WildLions <maksymdeveloper88@gmail.com\n>',
      },
      template: {
        dir: join(__dirname + '/../../../templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class MailModule {}
