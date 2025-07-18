import { Inject, Injectable } from '@nestjs/common';
import { PrismaPaymentsService } from 'apps/payments/prisma-payments-database/prisma.service';
import * as paypal from '@paypal/checkout-server-sdk';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PayPalInputModel } from 'apps/auth/src/payments/api/models/input/payPal-input.model';
import { PaymentsQueryRepository } from '../infrastructure/payments-query.repository';

@Injectable()
export class PaymentsPaypalService {
  private client: paypal.core.PayPalHttpClient;

  constructor(
    protected prismaPaymentsService: PrismaPaymentsService,
    protected paymentsQueryRepository: PaymentsQueryRepository,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    // Настройка PayPal клиента
    const environment = new paypal.core.SandboxEnvironment(
      'AW6UFq0_zfFfhaU0eOtUD9J7mxRv97pjFHo47-06-LlZsB_oUNf_ZtOVQPJ8E1BoQZLUQ83jQeYtMohI',
      'EKsJv3PrIvXA_wUbBXKE8dFcl1UiCgTl6ZMtsGC1g2E4cuHvr29fn-FoZ4almSiHUwQy6KJGT9Grzy7m',
    );
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async buyPaypal(
    payPalInputModel: PayPalInputModel,
  ): Promise<{ succeeded: boolean; data: string; message?: string }> {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: payPalInputModel.value.toString(),
            },
            description: `Payment for user ${payPalInputModel.userID}`,
          },
        ],
        application_context: {
          return_url: 'https://excubator.xyz/api/v1',
          cancel_url: 'https://excubator.xyz/api/v1/cancel',
        },
      });
      if (!payPalInputModel.userID) {
        throw new Error('user id cannot be null');
      }
      const order = await this.client.execute(request);

      const payRes =
        await this.paymentsQueryRepository.getPayPalInformationByUserId(
          payPalInputModel.userID,
        );

      if (payRes) {
        await this.prismaPaymentsService.informatioPayPal.updateMany({
          where: { userId: payPalInputModel.userID },
          data: {
            payIdPal: order.result.id,
            status: order.result.status,
            amount: order.result.purchase_units[0].amount.value,
            autoPay: true,
            subscriptionTerm: payPalInputModel.subscriptionTerm || 'month',
          },
        });
      } else {
        await this.prismaPaymentsService.informatioPayPal.create({
          data: {
            payIdPal: order.result.id,
            status: order.result.status,
            amount: order.result.purchase_units[0].amount.value,
            IPaymentMethodData: 'paypal',
            userId: payPalInputModel.userID,
            autoPay: true,
            subscriptionTerm: payPalInputModel.subscriptionTerm || 'month',
          },
        });
      }

      await this.prismaPaymentsService.paymentsUser.create({
        data: {
          providerPayId: order.result.id,
          status: order.result.status,
          amount: order.result.purchase_units[0].amount.value,
          IPaymentMethodData: 'paypal',
          subscriptionStart: undefined,
          subscriptionTerm: payPalInputModel.subscriptionTerm || null,
          userId: payPalInputModel.userID,
        },
      });
      const approveLink = order.result.links.find(
        (link) => link.rel === 'approve',
      )?.href;

      if (!approveLink) {
        return { succeeded: false, data: '', message: 'No approve link found' };
      }
      this.pollPaymentStatus(
        order.result.id,
        payPalInputModel.subscriptionTerm || 'month',
        payPalInputModel.userID,
      );
      return {
        succeeded: true,
        data: approveLink,
        message: 'Payment created successfully',
      };
    } catch (error) {
      console.error('Error creating PayPal payment:', error);
      return {
        succeeded: false,
        data: '',
        message: 'Error creating PayPal payment',
      };
    }
  }

  async cancelAutoPayment(
    userId: number,
  ): Promise<{ succeeded: boolean; message?: string; data?: any }> {
    try {
      const payment =
        await this.prismaPaymentsService.informatioPayPal.findFirst({
          where: { userId, autoPay: true },
        });

      if (!payment) {
        return {
          succeeded: false,
          message: 'No active subscription found',
          data: {},
        };
      }

      await this.prismaPaymentsService.informatioPayPal.update({
        where: { payIdPal: payment.payIdPal },
        data: { autoPay: false, updatedAt: new Date() },
      });

      return {
        succeeded: true,
        message: 'Auto payment cancelled successfully',
        data: {},
      };
    } catch (error) {
      console.error('Error cancelling PayPal auto payment:', error);
      return {
        succeeded: false,
        message: 'Error cancelling auto payment',
        data: {},
      };
    }
  }

  private async pollPaymentStatus(
    orderId: string,
    subscriptionTerm: '1day' | '7days' | 'month',
    userId?: number,
  ) {
    const interval = setInterval(async () => {
      try {
        const request = new paypal.orders.OrdersGetRequest(orderId);
        const order = await this.client.execute(request);
        const now = new Date();

        if (order.result.status === 'APPROVED') {
          await this.prismaPaymentsService.informatioPayPal.update({
            where: { payIdPal: orderId },
            data: {
              status: 'succeeded',
              updatedAt: now,
              subscriptionStart: now,
              subscriptionEnd: this.calculateEndDate(now, subscriptionTerm),
              subscriptionTerm: subscriptionTerm,
              isRenewed: true,
            },
          });

          await this.prismaPaymentsService.paymentsUser.update({
            where: { providerPayId: orderId },
            data: {
              status: 'succeeded',
              subscriptionStart: new Date(),
              subscriptionTerm,
            },
          });

          console.log(userId, 'fsdfsdfsd');
          try {
            this.authClient
              .emit('payment_change_status', {
                userId: userId,
                type: 'Business',
              })
              .subscribe({
                error: (err) => console.error('Emit error:', err),
                complete: () => console.log('Emit sent'),
              });
          } catch (error) {
            console.log(error, 'error');
          }

          clearInterval(interval);
        } else if (order.result.status === 'canceled') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling PayPal payment status:', error);
        clearInterval(interval);
      }
    }, 10000);
  }

  async getActiveSubscriptions(): Promise<any[]> {
    try {
      const now = new Date();
      return await this.prismaPaymentsService.informatioPayPal.findMany({
        where: {
          autoPay: true,
          subscriptionEnd: { lte: now },
          IPaymentMethodData: 'paypal',
        },
      });
    } catch (error) {
      console.error('Error fetching active PayPal subscriptions:', error);
      return [];
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkPendingPaymentsPaypal() {
    const pending = await this.prismaPaymentsService.informatioPayPal.findMany({
      where: {
        status: 'CREATED', // PayPal использует CREATED для незавершенных заказов
        IPaymentMethodData: 'paypal',
      },
    });

    for (const payment of pending) {
      try {
        const request = new paypal.orders.OrdersGetRequest(payment.payIdPal);
        const order = await this.client.execute(request);
        const status = order.result.status;
        const now = new Date();

        if (status === 'APPROVED') {
          await this.prismaPaymentsService.informatioPayPal.update({
            where: { payIdPal: payment.payIdPal },
            data: {
              status: 'succeeded',
              updatedAt: now,
              subscriptionStart: now,
              subscriptionEnd: this.calculateEndDate(
                now,
                //@ts-ignore
                payment.subscriptionTerm,
              ),
              isRenewed: true,
            },
          });

          await this.prismaPaymentsService.paymentsUser.update({
            where: { providerPayId: payment.payIdPal },
            data: {
              status: 'succeeded',
              subscriptionStart: new Date(),
              subscriptionTerm: payment.subscriptionTerm || 'month',
            },
          });

          this.authClient.emit('payment_change_status', {
            userId: payment.userId,
            type: 'Business',
          });
        } else if (status === 'VOIDED' || status === 'CANCELLED') {
          await this.prismaPaymentsService.informatioPayPal.update({
            where: { payIdPal: payment.payIdPal },
            data: {
              status: 'canceled',
              updatedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error('Error checking PayPal payment status:', error);
      }
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkEndDatePaymentsPaypal() {
    const now = new Date();

    const expiredSubscriptions =
      await this.prismaPaymentsService.informatioPayPal.findMany({
        where: {
          autoPay: false,
          subscriptionEnd: { lte: now },
          IPaymentMethodData: 'paypal',
        },
      });
    for (const sub of expiredSubscriptions) {
      try {
        this.authClient.emit('payment_change_status', {
          userId: sub.userId,
          type: 'Personal',
        });
      } catch (error) {
        console.error(
          `Error processing expired PayPal subscription for user ${sub.userId}:`,
          error,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async checkSubscriptionsPaypal() {
    const now = new Date();
    const subscriptions =
      await this.prismaPaymentsService.informatioPayPal.findMany({
        where: {
          autoPay: true,
          subscriptionEnd: { lte: now },
          IPaymentMethodData: 'paypal',
        },
      });

    for (const sub of subscriptions) {
      if (!sub.autoPay) {
        continue;
      }
      const term = (sub.subscriptionTerm || 'month') as
        | '1day'
        | '7days'
        | 'month';

      try {
        // Создаем новый заказ PayPal для автоплатежа
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: sub.amount.toString(),
              },
              description: `Auto-renewal for user ${sub.userId}`,
              custom_id: sub.userId.toString(),
            },
          ],
          application_context: {
            return_url: 'https://your-app.com/success',
            cancel_url: 'https://your-app.com/cancel',
          },
        });

        const order = await this.client.execute(request);

        // Сохраняем новый заказ в базе
        await this.prismaPaymentsService.informatioPayYoo.create({
          data: {
            payIdYoo: order.result.id,
            status: order.result.status,
            //@ts-ignore
            amount: parseFloat(order.result.purchase_units[0].amount.value),
            IPaymentMethodData: 'paypal',
            userId: sub.userId,
            autoPay: true,
            subscriptionTerm: term,
            subscriptionStart: now,
            subscriptionEnd: this.calculateEndDate(now, term),
            renewalDate: now,
            isRenewed: true,
          },
        });

        await this.prismaPaymentsService.paymentsUser.create({
          data: {
            providerPayId: order.result.id,
            status: order.result.status,
            //@ts-ignore
            amount: parseFloat(order.result.purchase_units[0].amount.value),
            IPaymentMethodData: 'paypal',
            subscriptionStart: now,
            subscriptionTerm: term,
            userId: sub.userId,
          },
        });

        this.pollPaymentStatus(order.result.id, term, sub.userId);
      } catch (error) {
        console.error('Error processing PayPal subscription:', error);
      }
    }
  }

  private calculateEndDate(
    startDate: Date,
    term: '1day' | '7days' | 'month',
  ): Date {
    const endDate = new Date(startDate);
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
    return endDate;
  }
}
