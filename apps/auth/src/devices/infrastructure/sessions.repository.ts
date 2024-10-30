import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Session } from '../domain/createDeviceSession.model';

@Injectable()
export class SessionsRepository {
  constructor(protected prismaService: PrismaService) {}

  async createDeviceSession(newSessionDTO: Session): Promise<void> {
    await this.prismaService.session.create({
      data: newSessionDTO,
    });
  }
}
