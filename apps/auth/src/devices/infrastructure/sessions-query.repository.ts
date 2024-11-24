import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { deviceSessionDTO } from '../api/model/output/deviceOutput.types';

@Injectable()
export class SessionsQueryRepository {
  constructor(protected prismaService: PrismaService) {}

  async findAllSessionsByUserId(userId: number): Promise<deviceSessionDTO[]> {
    const data = await this.prismaService.session.findMany({
      where: { userId },
    });
    return data.map((session) => {
      return {
        ip: session.ip,
        title: session.deviceName,
        lastActiveDate: session.issuedAt.toISOString(),
        deviceId: session.deviceId,
      };
    });
  }
}
