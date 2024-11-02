import { Injectable } from '@nestjs/common';
import { userCreateDTO } from '../api/models/input/users.types';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailConfirmation, User } from '@prisma/client';

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
  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: { OR: [{ email: loginOrEmail }, { userName: loginOrEmail }] },
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
  async updateConfirmationCode(updateConfirmationCode: {
    confirmationCode: string;
    expirationDate: Date;
    userId: number;
  }): Promise<void> {
    await this.prismaService.emailConfirmation.update({
      where: { userId: updateConfirmationCode.userId },
      data: {
        expirationDate: updateConfirmationCode.expirationDate,
        confirmationCode: updateConfirmationCode.confirmationCode,
      },
    });
  }
  async findEmailConfirmationByCode(
    code: string,
  ): Promise<EmailConfirmation | null> {
    return this.prismaService.emailConfirmation.findFirst({
      where: { confirmationCode: code },
    });
  }
  async changeEmailConfirmationStatus(data: {
    userId: number;
    code: string;
    emailConfirmationCode: string;
    isConfirmed: boolean;
  }): Promise<void> {
    await this.prismaService.emailConfirmation.update({
      where: { userId: data.userId, confirmationCode: data.code },
      data: {
        confirmationCode: data.emailConfirmationCode,
        isConfirmed: data.isConfirmed,
      },
    });
  }
  async changePassword(userId: number, passwordHash: string) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
