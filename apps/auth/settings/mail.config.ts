import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsString, validateSync } from 'class-validator';
import { configValidationUtility } from '../../../common/config-validation.utility';

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
  emailPass: string = this.configService.get('EMAIL_PASS');

  @IsNotEmpty({ message: 'Set env variable EMAIL_CONFIRM_URL' })
  @IsString({ message: 'Env variable EMAIL_CONFIRM_URL has to type of string' })
  emailConfirmUrl: string = this.configService.get('EMAIL_CONFIRM_URL');

  @IsNotEmpty({ message: 'Set env variable PASSWORD_RECOVERY_URL' })
  @IsString({
    message: 'Env variable PASSWORD_RECOVERY_URL has to type of string',
  })
  passwordRecoveryUrl: string = this.configService.get('PASSWORD_RECOVERY_URL');

  constructor(private configService: ConfigService) {
    console.log('mail.config');
    console.log('mail.config first character emailPass', this.emailPass);
    console.log('emailConfirmUrl', this.emailConfirmUrl);
    console.log('passwordRecoveryUrl', this.passwordRecoveryUrl);

    configValidationUtility.validateConfig(this);

    // const errors = validateSync(this);
    // if (errors.length > 0) {
    //   const sortedMessages = errors
    //     .map((error) => Object.values(error.constraints || {}).join(', '))
    //     .join('; ');
    //   throw new Error('Validation failed: ' + sortedMessages);
    //}
  }
}
