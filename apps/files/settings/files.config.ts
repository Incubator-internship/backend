import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { configValidationUtility } from '../../../common/config-validation.utility';

export enum Environment {
  DEVELOPMENT = 'files.development',
  PRODUCTION = 'files.production',
  TESTING = 'files.testing',
  STAGING = 'files.staging',
}

@Injectable()
export class FilesConfig {
  @IsEnum(Environment)
  env: string = this.configService.get('NODE_ENV') as string;

  @IsNotEmpty({ message: 'Set env variable PORT' })
  @IsNumber({}, { message: 'Env variable PORT has to type of number' })
  @Min(1000)
  port: number = Number(this.configService.get('PORT'));

  @IsNotEmpty({ message: 'Set env variable S3_ACCESS_KEY_ID' })
  @IsString({ message: 'Env variable S3_ACCESS_KEY_ID has to type of string' })
  s3AccessKeyId: string = this.configService.get('S3_ACCESS_KEY_ID') as string;

  @IsNotEmpty({ message: 'Set env variable S3_SECRET_ACCESS_KEY' })
  @IsString({
    message: 'Env variable S3_SECRET_ACCESS_KEY has to type of string',
  })
  s3SecretAccessKey: string = this.configService.get(
    'S3_SECRET_ACCESS_KEY',
  ) as string;

  @IsNotEmpty({ message: 'Set env variable S3_REGION' })
  @IsString({ message: 'Env variable S3_REGION has to type of string' })
  s3Region: string = this.configService.get('S3_REGION') as string;

  @IsNotEmpty({ message: 'Set env variable S3_BUCKET_NAME' })
  @IsString({ message: 'Env variable S3_BUCKET_NAME has to type of string' })
  s3BucketName: string = this.configService.get('S3_BUCKET_NAME') as string;

  constructor(private configService: ConfigService) {
    //todo delete console.log auth config
    console.log('check my env all variables');
    console.log('auth.config port ', this.port);
    console.log('auth.config typeof port ', typeof this.port);
    console.log('s3AccessKeyId', this.s3AccessKeyId);
    console.log('s3SecretAccessKey', this.s3SecretAccessKey);
    console.log('s3Region', this.s3Region);
    console.log('s3BucketName', this.s3BucketName);
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
