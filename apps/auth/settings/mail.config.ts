import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsString, validateSync } from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'auth.development',
  PRODUCTION = 'production',
  TESTING = 'testing',
  STAGING = 'staging',
}

@Injectable()
export class MailConfig {
  @IsEnum(Environment)
  env: string = this.configService.get('NODE_ENV');

  @IsNotEmpty({ message: 'Set env variable EMAIL_PASS' })
  @IsString({ message: 'Env variable EMAIL_PASS has to type of string' })
  emailPass = this.configService.get('EMAIL_PASS');

  constructor(private configService: ConfigService) {
    console.log('mail.config');
    console.log('mail.config first character emailPass', this.emailPass[0]);

    const errors = validateSync(this);
    if (errors.length > 0) {
      const sortedMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      throw new Error('Validation failed: ' + sortedMessages);
    }
  }
}
