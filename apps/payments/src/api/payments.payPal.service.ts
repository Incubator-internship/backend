import { Inject, Injectable } from '@nestjs/common';
import { PrismaPaymentsService } from 'apps/payments/prisma-payments-database/prisma.service';
import * as paypal from '@paypal/checkout-server-sdk';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PayPalInputModel } from 'apps/auth/src/payments/api/models/input/payPal-input.model';
import { PaymentsQueryRepository } from '../infrastructure/payments-query.repository';
import { DateTime } from 'luxon';
import { HttpService } from '@nestjs/axios';
import { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';
import { DtoProductT } from 'apps/payments/types/types';
import { PaymentsRepository } from '../infrastructure/payments.repository';

@Injectable()
export class PaymentsPaypalService {
  private client: paypal.core.PayPalHttpClient;
  private paypalBaseUrl: string = 'https://api-m.sandbox.paypal.com';

  private get axios(): AxiosInstance {
    return this.httpService.axiosRef;
  }
  constructor(
    protected prismaPaymentsService: PrismaPaymentsService,
    protected paymentsQueryRepository: PaymentsQueryRepository,
    protected paymentsRepository: PaymentsRepository,
    readonly httpService: HttpService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    const environment = new paypal.core.SandboxEnvironment(
      'AW6UFq0_zfFfhaU0eOtUD9J7mxRv97pjFHo47-06-LlZsB_oUNf_ZtOVQPJ8E1BoQZLUQ83jQeYtMohI',
      'EKsJv3PrIvXA_wUbBXKE8dFcl1UiCgTl6ZMtsGC1g2E4cuHvr29fn-FoZ4almSiHUwQy6KJGT9Grzy7m',
    );
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createProduct(dtoProduct: DtoProductT) {
    const accessToken = await this.getAccessToken();
    const response = await this.axios.post(
      `${this.paypalBaseUrl}/v1/catalogs/products`,
      dtoProduct,
      {
        headers: {
          //@ts-ignore
          Authorization: `Bearer ${accessToken._accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `PRODUCT-${randomUUID()}`,
        },
      },
    );
    console.log(response.data, 'response.data');
    console.log(response.data.id, 'response.data.id');

    return response.data.id; // Возвращает product_id, например, PROD-5RN21878H3527870P
  }
  async getProdect(productId: string) {
    const accessToken = await this.getAccessToken();

    const response = await this.axios.get(
      `${this.paypalBaseUrl}/v1/catalogs/products/${productId}`,
      {
        headers: {
          //@ts-ignore
          Authorization: `Bearer ${accessToken._accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.id;
  }
  async createSubscriptionPlans(productId: string) {
    try {
      const accessToken = await this.getAccessToken();
      const plans = [
        {
          product_id: productId,
          name: 'Месячная подписка',
          description:
            'Месячная подписка для бизнес-аккаунта с расширенными функциями',
          billing_cycles: [
            {
              frequency: {
                interval_unit: 'MONTH',
                interval_count: 1,
              },
              tenure_type: 'REGULAR',
              sequence: 1,
              total_cycles: 0, // Бесконечный план
              pricing_scheme: {
                fixed_price: {
                  value: '100',
                  currency_code: 'USD',
                },
              },
            },
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: { value: '0', currency_code: 'USD' },
            setup_fee_failure_action: 'CONTINUE',
            payment_failure_threshold: 3,
          },
        },
        {
          product_id: productId,
          name: 'Недельная подписка',
          description:
            'Недельная подписка для бизнес-аккаунта с расширенными функциями',
          billing_cycles: [
            {
              frequency: {
                interval_unit: 'DAY',
                interval_count: 7,
              },
              tenure_type: 'REGULAR',
              sequence: 1,
              total_cycles: 0, // Бесконечный план
              pricing_scheme: {
                fixed_price: {
                  value: '50',
                  currency_code: 'USD',
                },
              },
            },
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: { value: '0', currency_code: 'USD' },
            setup_fee_failure_action: 'CONTINUE',
            payment_failure_threshold: 3,
          },
        },
        {
          product_id: productId,
          name: 'Дневная подписка',
          description:
            'Дневная подписка для бизнес-аккаунта с расширенными функциями',
          billing_cycles: [
            {
              frequency: {
                interval_unit: 'DAY',
                interval_count: 1,
              },
              tenure_type: 'REGULAR',
              sequence: 1,
              total_cycles: 0, // Бесконечный план
              pricing_scheme: {
                fixed_price: {
                  value: '10',
                  currency_code: 'USD',
                },
              },
            },
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: { value: '0', currency_code: 'USD' },
            setup_fee_failure_action: 'CONTINUE',
            payment_failure_threshold: 3,
          },
        },
      ];

      const createdPlans = [];
      for (const plan of plans) {
        const response = await this.axios.post(
          `${this.paypalBaseUrl}/v1/billing/plans`,
          plan,
          {
            headers: {
              //@ts-ignore
              Authorization: `Bearer ${accessToken._accessToken}`,
              'Content-Type': 'application/json',
              'PayPal-Request-Id': `PLAN-${randomUUID()}`,
            },
          },
        );
        //@ts-ignore
        createdPlans.push(response.data);
        console.log(response, 'response');
      }
      console.log(createdPlans, 'createdPlanscreatedPlans');
      return createdPlans;
    } catch (error) {
      console.log(error);
    }
  }
  async createSubscription(
    planId: string,
    returnUrl: string,
    cancelUrl: string,
    payPalInputModel: PayPalInputModel,
  ) {
    try {
      if (!payPalInputModel.userID) {
        throw new Error('userID is required');
      }
      const accessToken = await this.getAccessToken();
      const subscription = {
        plan_id: planId,
        application_context: {
          brand_name: 'insta',
          locale: 'en-US',
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      };

      const response: any = await this.axios.post(
        `${this.paypalBaseUrl}/v1/billing/subscriptions`,
        subscription,
        {
          headers: {
            //@ts-ignore
            Authorization: `Bearer ${accessToken._accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `SUB-${randomUUID()}`,
          },
        },
      );
      const payRes =
        await this.paymentsQueryRepository.getPayPalInformationByUserId(
          payPalInputModel.userID,
        );

      if (payRes) {
        const order = {
          payIdPal: response.id,
          status: response.status,
          planId: response.planId,
          amount: response.shipping_amount.value,
          IPaymentMethodData: 'paypal',
          autoPay: true,
          subscriptionTerm: payPalInputModel.subscriptionTerm || 'month',
          timezone: payPalInputModel.timezone,
        };

        await this.paymentsRepository.updatePayPalInformation(order);
      } else {
        const order = {
          payIdPal: response.data.id,
          status: response.data.status,
          planId: planId,
          amount: payPalInputModel.value,
          IPaymentMethodData: 'paypal',
          userId: payPalInputModel.userID,
          autoPay: true,
          subscriptionTerm: payPalInputModel.subscriptionTerm || 'month',
          timezone: payPalInputModel.timezone,
        };
        await this.paymentsRepository.createPayPalInformation(order);
      }
      return {
        succeeded: true,
        message: '',
        data: response.data.links.find((el) => el['rel'] === 'approve').href,
      };
    } catch (error) {
      console.log(error);

      return {
        succeeded: false,
        message: error,
        data: [],
      };
    }
  }
  // Приостановка подписки
  async suspendSubscription(subscriptionId: string, reason: string) {
    try {
      const accessToken = await this.getAccessToken();
      await this.axios.post(
        `/v1/billing/subscriptions/${subscriptionId}/suspend`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `SUSPEND-${randomUUID()}`,
          },
        },
      );
      return {
        succeeded: true,
        message: '',
        data: [],
      };
    } catch (error) {
      return {
        succeeded: false,
        message: '',
        data: [],
      };
    }
  }
  async cancelSubscription(subscriptionId: string, reason: string) {
    try {
      const accessToken = await this.getAccessToken();
      await this.axios.post(
        `${this.paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        { reason },
        {
          headers: {
            //@ts-ignore
            Authorization: `Bearer ${accessToken._accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        succeeded: true,
        message: '',
        data: [],
      };
    } catch (error) {
      return {
        succeeded: false,
        message: '',
        data: [],
      };
    }
  }
  async resumeSubscription(subscriptionId: string, reason: string) {
    try {
      const accessToken = await this.getAccessToken();
      await this.axios.post(
        `/v1/billing/subscriptions/${subscriptionId}/activate`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `ACTIVATE-${randomUUID()}`,
          },
        },
      );
      return {
        succeeded: true,
        message: '',
        data: [],
      };
    } catch (error) {
      return {
        succeeded: false,
        message: '',
        data: [],
      };
    }
  }
  async getAccessToken() {
    return await this.client.fetchAccessToken();
  }
  async getSubscriptionTransactions(subscriptionId: string, createdAt: any) {
    try {
      const transactionStartTime = DateTime.fromJSDate(createdAt)
        .toUTC() // переводим в UTC
        .toISO({ suppressMilliseconds: false });

      const transactionEndTime = DateTime.now()
        .toUTC()
        .toISO({ suppressMilliseconds: false });

      const accessToken = await this.getAccessToken();
      const response = await this.axios.get(
        `${this.paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}/transactions`,
        {
          headers: {
            //@ts-ignore
            Authorization: `Bearer ${accessToken._accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `TRANSACTIONS-${randomUUID()}`,
          },
          params: {
            start_time: transactionStartTime,
            end_time: transactionEndTime,
          },
        },
      );
      return {
        succeeded: true,
        message: '',
        data: response.data,
      };
    } catch (error) {
      return {
        succeeded: false,
        message: error,
        data: [],
      };
    }
  }
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await this.axios.get(
        `${this.paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            //@ts-ignore
            Authorization: `Bearer ${accessToken._accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        succeeded: true,
        message: '',
        data: response.data,
      };
    } catch (error) {
      return {
        succeeded: false,
        message: '',
        data: [],
      };
    }
  }

  async toggleAutoPayPaypal(
    userId: number,
    enable: boolean,
  ): Promise<{ succeeded: boolean; message?: string; data?: any }> {
    try {
      const payment =
        await this.prismaPaymentsService.informatioPayPal.findFirst({
          where: { userId },
        });

      if (!payment) {
        return {
          succeeded: false,
          message: 'No active subscription found',
          data: {},
        };
      }
      if (!enable) {
        const res = await this.suspendSubscription(
          payment.payIdPal,
          'такая жизнь',
        );
        if (!res.succeeded) {
          throw new Error(res.message);
        }
      } else {
        const resTwo = await this.resumeSubscription(
          payment.payIdPal,
          'такая жизнь',
        );

        if (!resTwo.succeeded) {
          throw new Error(resTwo.message);
        }
      }
      await this.prismaPaymentsService.informatioPayPal.update({
        where: { payIdPal: payment.payIdPal },
        data: { autoPay: enable },
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

  async listSubscriptions(customer_ids: string) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.axios.get(
        `${this.paypalBaseUrl}/v1/billing/subscriptions/`,
        {
          headers: {
            //@ts-ignore
            Authorization: `Bearer ${accessToken._accessToken}`,
            'Content-Type': 'application/json',
          },
          params: {
            customer_ids: customer_ids,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkPendingSubscriptionPaypal() {
    const pendings =
      await this.paymentsQueryRepository.getTransactionsPending();

    for (const payment of pendings) {
      try {
        const result = await this.getSubscription(payment.payIdPal);

        if (result.data.status === 'ACTIVE') {
          this.authClient
            .emit('payment_change_status', {
              userId: payment.userId,
              type: 'Business',
              term: payment.subscriptionTerm,
              amount: payment.amount,
              nextPayment: result.data.billing_info.next_billing_time,
            })
            .subscribe({
              error: (err) => console.error('Emit error:', err),
              complete: () => console.log('Emit sent'),
            });

          await this.paymentsRepository.updatePayPalDate(
            result.data.start_time,
            result.data.billing_info.next_billing_time,
            payment.payIdPal,
          );
          await this.paymentsRepository.updatePayPalStatus(
            'ACTIVE',
            payment.payIdPal,
          );
        }
      } catch (error) {
        console.error('Error checking PayPal payment status:', error);
      }
    }
  }

  @Cron(CronExpression.EVERY_11_HOURS)
  async checkEndDatePaymentsPaypal() {
    const expiredSubscriptions =
      await this.prismaPaymentsService.informatioPayPal.findMany({
        where: {
          IPaymentMethodData: 'paypal',
        },
      });
    for (const sub of expiredSubscriptions) {
      const res = await this.getSubscription(sub.payIdPal);

      if (res.data.status !== 'ACTIVE') {
        try {
          await this.paymentsRepository.updatePayPalAutoPay(
            sub.payIdPal,
            false,
          );

          this.authClient
            .emit('payment_change_status', {
              userId: sub.userId,
              type: 'Personal',
              term: '',
              amount: '',
            })
            .subscribe({
              error: (err) => console.error('Emit error:', err),
              complete: () => console.log('Emit sent'),
            });
        } catch (error) {
          console.error(
            `Error processing expired PayPal subscription for user ${sub.userId}:`,
            error,
          );
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async isSubscriptionRenewed() {
    const subscriptionsRaw =
      await this.paymentsQueryRepository.getSubscriptions();

    const now = DateTime.utc();

    const expiredSubscriptions = subscriptionsRaw.filter((sub) => {
      const subscriptionEndInTZ = DateTime.fromJSDate(sub.subscriptionEnd!, {
        zone: 'UTC',
      }).setZone(sub.timezone!, { keepLocalTime: true });
      if (!subscriptionEndInTZ.isValid) {
        return false;
      }

      const nowInTZ = now.setZone(sub.timezone!);
      return subscriptionEndInTZ <= nowInTZ;
    });

    for (const sub of expiredSubscriptions) {
      try {
        const res = await this.getSubscriptionTransactions(
          sub.payIdPal,
          sub.createdAt,
        );

        if (!res.data?.length) continue;
        const subscriptionEndInTZ = DateTime.fromJSDate(sub.subscriptionEnd!, {
          zone: 'UTC',
        }).setZone(sub.timezone!, { keepLocalTime: true });

        const lastPaymentTime = DateTime.fromISO(
          res.data.transactions[res.data.transactions.length - 1].time,
          { zone: 'utc' },
        );

        if (
          lastPaymentTime < subscriptionEndInTZ ||
          res.data.transactions[res.data.transactions.length - 1].status !=
            'COMPLETED'
        ) {
          await this.paymentsRepository.updatePayPalAutoPay(
            sub.payIdPal,
            false,
          );
          this.authClient
            .emit('payment_change_status', {
              userId: sub.userId,
              type: 'Personal',
              term: '',
              amount: '',
            })
            .subscribe({
              error: (err) => console.error('Emit error:', err),
              complete: () => console.log('Emit sent'),
            });
        }
      } catch (error) {
        console.error('Error processing PayPal subscription:', error);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async sendUpcomingPaymentReminder() {
    const subscriptions = await this.paymentsQueryRepository.getSubscriptions();

    const now = DateTime.utc();
    for (const sub of subscriptions) {
      if (sub.subscriptionTerm === '1day') {
        continue;
      }
      if (!sub.subscriptionEnd || !sub.timezone) continue;

      const endDate = DateTime.fromJSDate(sub.subscriptionEnd, {
        zone: 'UTC',
      }).setZone(sub.timezone, { keepLocalTime: true });

      const diffInHours = endDate.diff(
        now.setZone(sub.timezone),
        'hours',
      ).hours;
      if (diffInHours > 23 && diffInHours < 25) {
        this.authClient
          .emit('subscription_expiry_reminder', {
            userId: sub.userId,
            daysUntilExpiry: 1,
          })
          .subscribe({
            error: (err) => console.error('Emit error:', err),
            complete: () => console.log('Emit sent'),
          });
      }
    }
  }
}
