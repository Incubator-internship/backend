import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfig {
  port: number = Number(this.configService.get('PORT'));
  dbURL: string = this.configService.get('DATABASE_URL');

  constructor(private configService: ConfigService) {}
}
