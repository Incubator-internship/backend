import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SessionModel } from '../domain/createDeviceSession.model';
import { Session } from '@prisma/client';

@Injectable()
export class SessionsRepository {
  constructor(protected prismaService: PrismaService) {}

  async createDeviceSession(newSessionDTO: SessionModel): Promise<void> {
    await this.prismaService.session.create({
      data: newSessionDTO,
    });
  }

  async findSessionForCheckCookie(
    userId: number,
    deviceId: string,
    issuedAt: string,
  ): Promise<Session | null> {
    return this.prismaService.session.findFirst({
      where: { userId, deviceId, issuedAt },
    });
  }

  async findSessionByUserIdAndDeviceId(
    userId: number,
    deviceId: string,
  ): Promise<Session | null> {
    console.log('findSessionByUserIdAndDeviceId');
    console.log(typeof userId);
    console.log(userId);
    return this.prismaService.session.findFirst({
      where: { userId, deviceId },
    });
  }

  async deleteSession(userId: number, deviceId: string): Promise<void> {
    await this.prismaService.session.deleteMany({
      where: { userId, deviceId },
    });
  }

  async updateSession(
    userId: number,
    deviceId: string,
    issuedAt: string,
  ): Promise<void> {
    await this.prismaService.session.updateMany({
      where: { userId, deviceId },
      data: { issuedAt },
    });
  }

  async deleteDevicesExceptThisOne(
    userId: number,
    deviceId: string,
  ): Promise<void> {
    await this.prismaService.session.deleteMany({
      where: { userId, NOT: { deviceId } },
    });
  }

  async findSessionByDeviceId(deviceId: string): Promise<Session | null> {
    return this.prismaService.session.findFirst({ where: { deviceId } });
  }
}
