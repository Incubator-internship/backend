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
  @IsNotEmpty({ message: 'Set env variable PORT' })
  @IsNumber({}, { message: 'Env variable PORT has to type of number' })
  port: number = Number(this.configService.get('PORT'));
  @IsNotEmpty()
  @IsString()
  dbURL: string = this.configService.get('DATABASE_URL');

  @IsEnum(Environment)
  env: string = this.configService.get('NODE_ENV');

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
