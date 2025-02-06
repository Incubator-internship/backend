import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { configValidationUtility } from '../../../common/config-validation.utility';

export enum Environment {
  DEVELOPMENT = 'auth.development',
  PRODUCTION = 'auth.production',
  TESTING = 'auth.testing',
  STAGING = 'auth.staging',
}

@Injectable()
export class AuthConfig {
  @IsEnum(Environment)
  env: string = this.configService.get('NODE_ENV');

  @IsNotEmpty({ message: 'Set env variable PORT' })
  @IsNumber({}, { message: 'Env variable PORT has to type of number' })
  @Min(1000)
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

  @IsNotEmpty({ message: 'Set env variable REDIRECT_URL_GOOGLE_OAUTH' })
  @IsString({
    message: 'Env variable REDIRECT_URL_GOOGLE_OAUTH has to type of string',
  })
  redirectUrlGoogleOauth = this.configService.get('REDIRECT_URL_GOOGLE_OAUTH');

  @IsNotEmpty({ message: 'Set env variable IS_AUTOMATICALLY_CONFIRMED_USER' })
  @IsBoolean({
    message:
      'Env variable IS_AUTOMATICALLY_CONFIRMED_USER has to type of boolean',
  })
  isAutomaticallyConfirmedUser: boolean =
    this.configService.get('IS_AUTOMATICALLY_CONFIRMED_USER') === 'true';

  constructor(private configService: ConfigService) {
    //todo delete console.log auth config
    console.log('check my env all variables');
    console.log('auth.config port ', this.port);
    console.log('auth.config typeof port ', typeof this.port);
    console.log('dbURL', this.dbURL);
    console.log('jwtSecret', this.jwtSecret);
    console.log('emailPass', this.emailPass);
    console.log('googleClientId', this.googleClientId);
    console.log('googleClientSecret', this.googleClientSecret);
    console.log('googleCallBackLocalUrl', this.googleCallBackLocalUrl);
    console.log('googleCallBackProdUrl', this.googleCallBackProdUrl);
    console.log('recaptchaSecretKey', this.recaptchaSecretKey);
    console.log('recaptchaUrl', this.recaptchaUrl);
    console.log('emailConfirmUrl', this.emailConfirmUrl);
    console.log('passwordRecoveryUrl', this.passwordRecoveryUrl);
    console.log('redirectUrlGoogleOauth', this.redirectUrlGoogleOauth);
    console.log(
      'isAutomaticallyConfirmedUser',
      this.isAutomaticallyConfirmedUser,
    );
    console.log('env', this.env);
    //*******

    configValidationUtility.validateConfig(this);
    // const errors = validateSync(this);
    // if (errors.length > 0) {
    //   const sortedMessages = errors
    //     .map((error) => Object.values(error.constraints || {}).join(', '))
    //     .join('; ');
    //   throw new Error('Validation failed: ' + sortedMessages);
    // }
  }
}
