import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'auth.development',
  PRODUCTION = 'production',
  TESTING = 'testing',
  STAGING = 'staging',
}

@Injectable()
export class AuthConfig {
  @IsEnum(Environment)
  env: string = this.configService.get('NODE_ENV');

  @IsNotEmpty({ message: 'Set env variable PORT' })
  @IsNumber({}, { message: 'Env variable PORT has to type of number' })
  port: number = Number(this.configService.get('PORT'));

  @IsNotEmpty({ message: 'Set env variable DATABASE_URL' })
  @IsString({ message: 'Env variable DATABASE_URL has to type of string' })
  dbURL: string = this.configService.get('DATABASE_URL');

  @IsNotEmpty({ message: 'Set env variable JWT_SECRET' })
  @IsString({ message: 'Env variable JWT_SECRET has to type of number' })
  jwtSecret: string = this.configService.get('JWT_SECRET');

  @IsNotEmpty({ message: 'Set env variable EMAIL_PASS' })
  @IsString({ message: 'Env variable EMAIL_PASS has to type of string' })
  emailPass = this.configService.get('EMAIL_PASS');

  @IsNotEmpty({ message: 'Set env variable GOOGLE_CLIENT_ID' })
  @IsString({ message: 'Env variable GOOGLE_CLIENT_ID has to type of string' })
  googleClientId = this.configService.get('GOOGLE_CLIENT_ID');

  @IsNotEmpty({ message: 'Set env variable GOOGLE_CLIENT_SECRET' })
  @IsString({
    message: 'Env variable GOOGLE_CLIENT_SECRET has to type of string',
  })
  googleClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

  @IsNotEmpty({ message: 'Set env variable GOOGLE_CLIENT_ID' })
  @IsString({ message: 'Env variable GOOGLE_CLIENT_ID has to type of string' })
  googleCallBackLocalUrl = this.configService.get('GOOGLE_CALLBACK_LOCAL_URL');

  @IsNotEmpty({ message: 'Set env variable GOOGLE_CLIENT_ID' })
  @IsString({ message: 'Env variable GOOGLE_CLIENT_ID has to type of string' })
  googleCallBackProdUrl = this.configService.get('GOOGLE_CALLBACK_PROD_URL');

  @IsNotEmpty({ message: 'Set env variable GOOGLE_CLIENT_ID' })
  @IsString({ message: 'Env variable GOOGLE_CLIENT_ID has to type of string' })
  recaptchaSecretKey = this.configService.get('RECAPTCHA_SECRET_KEY');

  @IsNotEmpty({ message: 'Set env variable GOOGLE_CLIENT_ID' })
  @IsString({ message: 'Env variable GOOGLE_CLIENT_ID has to type of string' })
  recaptchaUrl = this.configService.get('RECAPTCHA_URL');

  @IsNotEmpty({ message: 'Set env variable EMAIL_CONFIRM_URL' })
  @IsString({ message: 'Env variable EMAIL_CONFIRM_URL has to type of string' })
  emailConfirmUrl = this.configService.get('EMAIL_CONFIRM_URL');

  @IsNotEmpty({ message: 'Set env variable EMAIL_CONFIRM_URL' })
  @IsString({ message: 'Env variable EMAIL_CONFIRM_URL has to type of string' })
  passwordRecoveryUrl = this.configService.get('PASSWORD_RECOVERY_URL');

  constructor(private configService: ConfigService) {
    console.log('port ', this.port);
    console.log('typeof port ', typeof this.port);

    const errors = validateSync(this);
    if (errors.length > 0) {
      const sortedMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      throw new Error('Validation failed: ' + sortedMessages);
    }
  }
}
