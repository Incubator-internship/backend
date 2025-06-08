import { Injectable } from '@nestjs/common';
import { PrismaPaymentsService } from 'apps/payments/prisma-payments-database/prisma.service';

@Injectable()
export class PaymentsQueryRepository {
  constructor(protected prismaPaymentsService: PrismaPaymentsService) {}

  async getPayInformationByUserId(userId: number) {
    return this.prismaPaymentsService.informatioPayYoo.findUnique({
      where: {
        userId: userId,
      },
      select: {
        payIdYoo: true,
        status: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        subscriptionTerm: true,
        isRenewed: true,
        autoPay: true,
        IPaymentMethodData: true,
      },
    });
  }

  async getUserPaymentHistory(userId: number) {
    return await this.prismaPaymentsService.paymentsUser.findMany({
      where: { userId },
    });
  }
}
