import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersQueryRepository {
  constructor(protected prismaService: PrismaService) {}
  async getAllUsers() {
    const allUsers = await this.prismaService.user.findMany();
    console.log('allUsers ', allUsers);
    return allUsers.map((u) => {
      return {
        id: u.id.toString(),
        name: u.userName,
        email: u.email,
        createdAt: u.createdAt,
      };
    });
  }
}
