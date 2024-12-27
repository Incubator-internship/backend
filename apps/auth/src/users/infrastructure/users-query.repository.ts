import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  AllUsersType,
  UserAuthMeDTO,
} from '../api/models/output/userOutput.types';

@Injectable()
export class UsersQueryRepository {
  constructor(protected prismaService: PrismaService) {}

  async getAllUsers(): Promise<AllUsersType[]> {
    const allUsers = await this.prismaService.user.findMany();
    return allUsers.map((u) => {
      return {
        id: u.id.toString(),
        name: u.userName,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
      };
    });
  }

  async getUserByIdForAuthMe(userId: number): Promise<null | UserAuthMeDTO> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const userMapped: UserAuthMeDTO = {
      userId: user.id,
      login: user.userName,
      email: user.email,
    };

    return userMapped;
  }
}
