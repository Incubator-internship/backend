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

  @IsNotEmpty()
  @IsString()
  dbURL: string = this.configService.get('DATABASE_URL');

  @IsNotEmpty({ message: 'Set env variable JWT_SECRET' })
  @IsNumber({}, { message: 'Env variable JWT_SECRET has to type of number' })
  jwtSecret:number=this.configService.get('JWT_SECRET')

  @
  EMAIL_PASS=regh zmcs mofm qkml
  GOOGLE_CLIENT_ID=1031427518143-4f2kr0fkrd4bpas00t8233u0dsr2kvhh.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=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
  GOOGLE_CALLBACK_LOCAL_URL=http://localhost:5000/api/v1/auth/google-redirect
  GOOGLE_CALLBACK_PROD_URL=https://excubator.xyz/api/v1/auth/google-redirect
  RECAPTCHA_SECRET_KEY=6LcghJMqAAAAAGUeTXwJ-m166AP7BoxmXAS4A6ax
  RECAPTCHA_URL=https://www.google.com/recaptcha/api/siteverify


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
