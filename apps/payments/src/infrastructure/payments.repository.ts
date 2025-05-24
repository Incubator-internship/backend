import { Payment } from '@a2seven/yoo-checkout';
import { Injectable } from '@nestjs/common';
import { PrismaPaymentsService } from 'apps/payments/prisma-payments-database/prisma.service';

@Injectable()
export class PaymentsRepository {
  constructor(protected prismapaymentsService: PrismaPaymentsService) {}

  async createPayInformation(payInformation: Payment, userID: number) {
    await this.prismapaymentsService.informatioPayYoo.create({
      data: {
        payIdYoo: payInformation.id,
        status: payInformation.status,
        amount: payInformation.amount.value,
        IPaymentMethodData: payInformation.payment_method.type,
        userId: userID,
        autoPay: true,
      },
    });
  }
  async insertPayInformation(
    payIdYoo: string,
    term: '1day' | '7days' | 'month',
  ) {
    const now = new Date();
    const endDate = new Date();

    // Рассчитываем дату окончания в зависимости от периода
    switch (term) {
      case '1day':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case '7days':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      default:
        throw new Error('Неверный период подписки');
    }

    await this.prismapaymentsService.informatioPayYoo.update({
      where: { payIdYoo },
      data: {
        status: 'succeeded',
        autoPay: true,
        subscriptionStart: now, // Дата начала
        subscriptionEnd: endDate, // Дата окончания
        renewalDate: now, // Дата продления
        subscriptionTerm: term, // Период подписки
        isRenewed: true, // Отметка о продлении
        updatedAt: now,
      },
    });
  }

  async cancelAutoPayment(payIdYoo: string) {
    await this.prismapaymentsService.informatioPayYoo.update({
      where: { payIdYoo },
      data: {
        autoPay: false,
      },
    });
  }

  async getActiveSubscriptions() {
    const now = new Date();

    const result = await this.prismapaymentsService.informatioPayYoo.findMany({
      where: {
        autoPay: true,
        subscriptionEnd: {
          lte: now,
        },
      },
    });

    return result;
  }
  async updateSubscriptions(updatedSubscriptionData: any) {
    await this.prismapaymentsService.informatioPayYoo.update({
      where: { payIdYoo: updatedSubscriptionData.payIdYoo },
      data: {
        subscriptionStart: updatedSubscriptionData.newStart,
        subscriptionEnd: updatedSubscriptionData.newEnd,
        renewalDate: updatedSubscriptionData.newStart,
        updatedAt: updatedSubscriptionData.newStart,
      },
    });
  }

  async createPaymentsUser(insertPaymentsUserData: any) {
    await this.prismapaymentsService.paymentsUser.create({
      data: {
        payIdYoo: insertPaymentsUserData.id,
        status: insertPaymentsUserData.status,
        amount: insertPaymentsUserData.amount.value,
        IPaymentMethodData: insertPaymentsUserData.payment_method.type,
        subscriptionStart: insertPaymentsUserData.subscriptionStart,
        subscriptionTerm: insertPaymentsUserData.subscriptionTerm,
        userId: insertPaymentsUserData.userID,
      },
    });
  }
}
