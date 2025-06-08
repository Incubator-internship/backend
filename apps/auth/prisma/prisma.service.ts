import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './auth-database-client-types';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Note: this is optional
    await this.$connect();
  }
}
