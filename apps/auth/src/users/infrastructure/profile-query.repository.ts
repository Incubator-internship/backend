import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Profile } from '@prisma/client';
import { format } from 'date-fns';
import { ProfileOutputDTO } from '../api/models/output/profileOutput.types';

@Injectable()
export class ProfileQueryRepository {
  constructor(protected prismaService: PrismaService) {}

  async getProfileById(profileId: number): Promise<ProfileOutputDTO | null> {
    const profile = await this.prismaService.profile.findUnique({
      where: { profileId },
    });
    if (!profile) {
      return null;
    }
    return {
      ...profile,
      dateOfBirthday: profile.dateOfBirthday
        ? format(new Date(profile.dateOfBirthday), 'dd.MM.yyyy')
        : null,
    };
  }
}
