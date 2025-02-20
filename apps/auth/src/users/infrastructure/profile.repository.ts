import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Profile } from '@prisma/client';

@Injectable()
export class ProfileRepository {
  constructor(protected prismaService: PrismaService) {}

  async getProfileById(profileId: number): Promise<Profile> {
    return await this.prismaService.profile.findUnique({
      where: { profileId },
    });
  }
}
