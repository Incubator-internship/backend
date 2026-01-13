import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

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

  @IsNotEmpty({ message: 'Set env variable DATABASE_URL' })
  @IsString({ message: 'Env variable RABBIT_URL has to type of string' })
  dbURL: string = this.configService.get('PAYMENTS_DATABASE_URL') as string;

  @IsNotEmpty({ message: 'Set env variable RABBIT_URL' })
  @IsString({ message: 'Env variable RABBIT_URL has to type of string' })
  rabbitURL: string = this.configService.get('RABBIT_URL') as string;
  static rabbitURL: any;

  constructor(private configService: ConfigService) {
    console.log('check my env all variables');
  }
}
