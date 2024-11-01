import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PasswordRecoveryModel } from '../domain/createPasswwordRecovery.model';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(protected prismaService: PrismaService) {}

  async createPasswordRecovery(
    passwordRecoveryModel: PasswordRecoveryModel,
  ): Promise<void> {
    await this.prismaService.passwordRecovery.create({
      data: passwordRecoveryModel,
    });
  }

  // async findRecoveryCodeByCode(
  //   recoveryCode: string,
  // ): Promise<null | PasswordRecovery> {
  //   return await this.passwordRecovery.findOne({ where: { recoveryCode } });
  // }
}
