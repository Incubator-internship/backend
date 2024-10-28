import { Injectable } from '@nestjs/common';
import { userCreateDTO } from '../api/models/input/users.types';
import { PrismaService } from 'apps/auth/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(protected prismaService: PrismaService) {}

  async createUser(userDTO: userCreateDTO): Promise<number> {
    const user = await this.prismaService.user.create({
      data: {
        userName: userDTO.userName,
        email: userDTO.email,
        passwordHash: userDTO.passwordHash,
        isDelete: userDTO.isDelete,
      },
    });
    return user.id;
  }
}
