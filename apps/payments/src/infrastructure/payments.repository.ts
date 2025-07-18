import { Payment } from '@a2seven/yoo-checkout';
import { Injectable } from '@nestjs/common';
import { PrismaPaymentsService } from 'apps/payments/prisma-payments-database/prisma.service';
import {
  InsertPaymentsUserData,
  UpdatedSubscriptionDataT,
} from 'apps/payments/types/types';

@Injectable()
export class PaymentsRepository {
  constructor(protected prismapaymentsService: PrismaPaymentsService) {}

  async createPayYooInformation(payInformation: Payment, userID: number) {
    try {
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
    } catch (error) {
      console.log(error);
    }
  }
  async insertPayYooInformation(payIdYoo: string, term: string) {
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

  async cancelAutoPaymentYoo(payIdYoo: string) {
    await this.prismapaymentsService.informatioPayYoo.update({
      where: { payIdYoo },
      data: {
        autoPay: false,
      },
    });
  }

  async getPendingPaymentsYoo() {
    return await this.prismapaymentsService.informatioPayYoo.findMany({
      where: {
        status: 'pending',
      },
    });
  }

  async getActiveSubscriptionsYoo() {
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
  async updateSubscriptionsYoo(
    updatedSubscriptionData: UpdatedSubscriptionDataT,
  ) {
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

  async createPaymentsUserYoo(insertPaymentsUserData: InsertPaymentsUserData) {
    await this.prismapaymentsService.paymentsUser.create({
      data: {
        providerPayId: insertPaymentsUserData.payIdYoo,
        status: insertPaymentsUserData.status,
        amount: insertPaymentsUserData.amount,
        IPaymentMethodData: insertPaymentsUserData.IPaymentMethodData,
        subscriptionStart: insertPaymentsUserData.subscriptionStart || null,
        subscriptionTerm: insertPaymentsUserData.subscriptionTerm || null,
        userId: insertPaymentsUserData.userId,
      },
    });
  }

  async insertUserPayYooInformation(payIdYoo: string, term: string) {
    const now = new Date();

    await this.prismapaymentsService.paymentsUser.update({
      where: { providerPayId: payIdYoo },
      data: {
        status: 'succeeded',
        subscriptionStart: now,
        subscriptionTerm: term,
      },
    });
  }
}
