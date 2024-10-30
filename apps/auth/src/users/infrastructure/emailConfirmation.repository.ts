import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailConfirmation } from '../domain/createEmailConfirmation.model';

@Injectable()
export class EmailConfirmationRepository {
  constructor(protected prismaService: PrismaService) {}

  async createEmailConfirmation(
    emailConfirmationDTO: EmailConfirmation,
  ): Promise<void> {
    await this.prismaService.emailConfirmation.create({
      data: emailConfirmationDTO,
    });
  }
}
