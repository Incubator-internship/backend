import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(protected prismaService: PrismaService) {}
}
