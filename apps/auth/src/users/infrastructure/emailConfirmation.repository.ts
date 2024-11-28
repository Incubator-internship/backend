import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailConfirmationModel } from '../domain/createEmailConfirmation.model';
import { EmailConfirmation } from '@prisma/client';

@Injectable()
export class EmailConfirmationRepository {
  constructor(protected prismaService: PrismaService) {}

  async createEmailConfirmation(
    emailConfirmationDTO: EmailConfirmationModel,
  ): Promise<void> {
    await this.prismaService.emailConfirmation.create({
      data: emailConfirmationDTO,
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
