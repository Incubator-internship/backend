import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailConfig } from '../settings/mail.config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: MailConfig,
  ) {}

  async sendUserConfirmationCode(
    email: string,
    userName: string,
    confirmationCode: string,
  ): Promise<void> {
    //todo check the email service and delete console.log we take url from env
    // const url = `https://excubator.xyz/confirm-email?code=${confirmationCode}`;
    const url = `${this.configService.emailConfirmUrl}${confirmationCode}`;

    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Thanks for registration! Confirm your Email',
        template: './registration',
        context: {
          userName,
          url,
          confirmationCode,
        },
      })
      .then(() => {
        console.log('Email sent');
      })
      .catch((e) => {
        console.log('Error sending email', e);
      });
  }
  async sendPasswordRecoveryCode(
    email: string,
    userName: string,
    passwordRecoveryCode: string,
  ): Promise<void> {
    //todo check the email service and delete console.log we take url from env
    // const url = `https://excubator.xyz/createnewpassword?code=${passwordRecoveryCode}`;
    const url = `${this.configService.passwordRecoveryUrl}${passwordRecoveryCode}`;

    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Password recovery',
        template: './password-recovery',
        context: {
          userName,
          url,
          passwordRecoveryCode,
        },
      })
      .then(() => {
        console.log('Email sent');
      })
      .catch((e) => {
        console.log('Error sending email', e);
      });
  }
}
