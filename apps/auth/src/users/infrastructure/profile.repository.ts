import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProfileDTOModel } from '../api/models/dto-models/createProfile.types';
import { Profile } from '../../../prisma/auth-database-client-types';

@Injectable()
export class ProfileRepository {
  constructor(protected prismaService: PrismaService) {}

  async getProfileById(profileId: number): Promise<Profile | null> {
    return this.prismaService.profile.findUnique({
      where: { profileId },
    });
  }

  async createProfile(profileDTO: ProfileDTOModel) {
    await this.prismaService.profile.create({ data: profileDTO });
  }

  async updateProfile(profile: ProfileDTOModel) {
    await this.prismaService.profile.update({
      where: { profileId: profile.profileId },
      data: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirthday: profile.dateOfBirthday,
        country: profile.country,
        city: profile.city,
        aboutMe: profile.aboutMe,
      },
    });
  }

  async updateProfileAvatar(
    profileId: number,
    originalAvatarUrl: string,
    smallAvatarUrl: string,
  ) {
    await this.prismaService.profile.update({
      where: { profileId },
      data: { originalAvatarUrl, smallAvatarUrl },
    });
  }

  async deleteAvatar(profileId: number) {
    await this.prismaService.profile.update({
      where: { profileId },
      data: { originalAvatarUrl: null, smallAvatarUrl: null },
    });
  }
}
