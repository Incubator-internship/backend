import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum } from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'payments.development',
  PRODUCTION = 'payments.production',
  TESTING = 'payments.testing',
  STAGING = 'payments.staging',
}

@Injectable()
export class PaymentsConfig {
  @IsEnum(Environment)
  env: string = this.configService.get('NODE_ENV') as string;

  constructor(private configService: ConfigService) {
    //todo delete console.log auth config
    console.log('check my env all variables');
    //*******

    // configValidationUtility.validateConfig(this);
    // const errors = validateSync(this);
    // if (errors.length > 0) {
    //   const sortedMessages = errors
    //     .map((error) => Object.values(error.constraints || {}).join(', '))
    //     .join('; ');
    //   throw new Error('Validation failed: ' + sortedMessages);
    // }
  }
}
