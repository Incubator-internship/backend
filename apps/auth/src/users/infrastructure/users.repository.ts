import { Injectable } from '@nestjs/common';
import { userCreateDTO } from '../api/models/input/users.types';
import { UserModel } from '../domain/createUser.model';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailConfirmationModel } from '../domain/createEmailConfirmation.model';
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
    const result = await this.prismaService.user.findUnique({
      where: { email: email },
      include: {
        emailConfirmation: true,
      },
    });
    console.log('findUserAndEmailConfirmationByEmail', result);
    return result;
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
}
