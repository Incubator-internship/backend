import { Injectable } from '@nestjs/common';
import { userCreateDTO } from '../api/models/input/users.types';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  EmailConfirmation,
  User,
} from '../../../prisma/auth-database-client-types';

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

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findEmailConfirmationByUserId(
    userId: number,
  ): Promise<EmailConfirmation | null> {
    return this.prismaService.emailConfirmation.findUnique({
      where: { userId },
    });
  }

  async findUserByLoginOrEmail(
    email: string,
    userName: string,
  ) /*: Promise<User | null>*/ {
    const user = await this.prismaService.user.findFirst({
      where: { OR: [{ email }, { userName }] },
      include: { provider: true },
    });
    return user;
  }

  async findUserAndEmailConfirmationByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email },
      include: {
        emailConfirmation: true,
      },
    });
  }

  async changePassword(userId: number, passwordHash: string) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id: userId } });
  }

  async updateUser(updateUserDTO: {
    email: string;
    userName: string;
    passwordHash: string;
  }): Promise<number> {
    const user = await this.prismaService.user.update({
      where: { email: updateUserDTO.email },
      data: {
        userName: updateUserDTO.userName,
        passwordHash: updateUserDTO.passwordHash,
      },
    });
    return user.id;
  }

  async findUniqueUserByUserName(userName: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { userName } });
  }

  async editUserName(userId: number, userName: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { userName },
    });
  }
  async updateUserType(type: string, userId: number) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        accountType: type,
      },
    });
  }
  async createProfile(userId: number) {
    await this.prismaService.profile.create({
      data: {
        user: {
          connect: { id: userId },
        },
      },
    });
  }
}
