import { Injectable } from '@nestjs/common';
import { PrismaPaymentsService } from 'apps/payments/prisma-payments-database/prisma.service';

@Injectable()
export class PaymentsQueryRepository {
  constructor(protected prismaPaymentsService: PrismaPaymentsService) {}

  async getPayInformationByUserId(userId: number) {
    return this.prismaPaymentsService.informatioPayYoo.findFirst({
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
  async getPayPalInformationByUserId(userId: number) {
    return this.prismaPaymentsService.informatioPayPal.findFirst({
      where: {
        userId: userId,
      },
      select: {
        payIdPal: true,
        status: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        subscriptionTerm: true,
        isRenewed: true,
        autoPay: true,
        userId: true,
        IPaymentMethodData: true,
      },
    });
  }
  async getUserPaymentHistory(userId: number) {
    return this.prismaPaymentsService.paymentsUser.findMany({
      where: {
        userId,
        status: 'succeeded',
      },
    });
  }
  async getActiveSubscription(userId: number) {
    return this.prismaPaymentsService.informatioPayPal.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });
  }
  async getTransactionsPending() {
    return await this.prismaPaymentsService.informatioPayPal.findMany({
      where: {
        status: 'APPROVAL_PENDING',
        IPaymentMethodData: 'paypal',
      },
    });
  }
  async getSubscriptions() {
    return await this.prismaPaymentsService.informatioPayPal.findMany({
      where: {
        autoPay: true,
        IPaymentMethodData: 'paypal',
      },
    });
  }
}
