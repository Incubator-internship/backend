import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, Payload } from '@nestjs/microservices';
import { ICreatePayment, YooCheckout } from '@a2seven/yoo-checkout';
import { YooInputModel } from 'apps/auth/src/payments/api/models/input/yooPay-input.model';
import { PaymentsRepository } from '../infrastructure/payments.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsQueryRepository } from '../infrastructure/payments-query.repository';
import { UpdatedSubscriptionDataT } from 'apps/payments/types/types';

@Injectable()
export class PaymentsYooService {
  constructor(
    protected paymentsRepository: PaymentsRepository,
    protected paymentsQueryRepository: PaymentsQueryRepository,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}
  private readonly checkout = new YooCheckout({
    shopId: '1088840',
    secretKey: 'test_B-yKhKbRQweW38Ps2RH4tARLcipAzkg3z-n63JLetko',
  });

  async buyYou(@Payload() yooInputModel: YooInputModel) {
    const createPaymentPayload = (
      yooInputModel: YooInputModel,
    ): ICreatePayment => {
      const basePayload: ICreatePayment = {
        amount: {
          value: yooInputModel.value,
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: 'https://excubator.xyz/api/v1',
        },
        save_payment_method: true,
        capture: true,
        description: yooInputModel.description,
      };

      if (yooInputModel.type === 'bank_card') {
        return {
          ...basePayload,
          payment_method_data: {
            type: yooInputModel.type,
            card: {
              ...yooInputModel.card,
              ...(yooInputModel.card.expiry_month?.length === 1 && {
                expiry_month: `0${yooInputModel.card.expiry_month}`,
              }),
            },
          },
        };
      }

      return {
        ...basePayload,
        payment_method_data: {
          type: yooInputModel.type,
        },
      };
    };

    try {
      const payment = await this.checkout.createPayment(
        createPaymentPayload(yooInputModel),
      );

      await this.paymentsRepository.createPayYooInformation(
        payment,
        yooInputModel.userID || 0,
      );

      await this.paymentsRepository.createPaymentsUserYoo({
        payIdYoo: payment.id,
        amount: payment.amount.value,
        IPaymentMethodData: payment.payment_method.type,
        userId: yooInputModel.userID || 0,
        status: payment.status,
        subscriptionStart: undefined,
        subscriptionTerm: yooInputModel.subscriptionTerm,
      });

      this.pollPaymentStatus(
        payment.id,
        yooInputModel.subscriptionTerm,
        yooInputModel.userID,
      );

      return {
        succeeded: true,
        message: '',
        data: { confirmation_url: payment.confirmation.confirmation_url },
      };
    } catch (error) {
      return {
        succeeded: false,
        message: '',
        data: {},
      };
    }
  }

  async cancelAutoPayment(userId: number) {
    try {
      const payYouId =
        await this.paymentsQueryRepository.getPayInformationByUserId(
          userId || 0,
        );

      if (!payYouId) {
        throw new Error('error');
      }

      await this.paymentsRepository.cancelAutoPaymentYoo(payYouId.payIdYoo);
      this.authClient.emit('payment_cancel_status', {
        userId: userId,
        type: 'Personal',
      });
      return {
        succeeded: true,
        message: '',
        data: {},
      };
    } catch (error) {
      return {
        succeeded: false,
        message: '',
        data: {},
      };
    }
  }

  async autoPayment(
    paymentMethodId: string,
    amount: string,
    subscriptionTerm: '1day' | '7days' | 'month',
    userId: number,
  ) {
    const payment = await this.checkout.createPayment({
      amount: {
        value: amount,
        currency: 'RUB',
      },
      payment_method_id: paymentMethodId,
      capture: true,
      description: 'dsadasd',
    });
    this.pollPaymentStatus(payment.id, subscriptionTerm, userId);
    return payment;
  }

  private pollPaymentStatus(
    paymentId: string,
    subscriptionTerm: '1day' | '7days' | 'month',
    userId?: number,
  ) {
    const interval = setInterval(async () => {
      try {
        const payment = await this.checkout.getPayment(paymentId);
        if (payment.status === 'succeeded') {
          await this.paymentsRepository.insertPayYooInformation(
            paymentId,
            subscriptionTerm,
          );
          await this.paymentsRepository.insertUserPayYooInformation(
            paymentId,
            subscriptionTerm,
          );
          this.authClient.emit('payment_succeeded_yoo', {
            userId: userId,
            type: 'Business',
          });
          clearInterval(interval);
        } else if (payment.status === 'canceled') {
          clearInterval(interval);
        }
      } catch (error) {
        console.log(error);
        clearInterval(interval);
      }
    }, 10000);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkPendingPayments() {
    const pending = await this.paymentsRepository.getPendingPaymentsYoo();

    for (const payment of pending) {
      try {
        const status = (await this.checkout.getPayment(payment.payIdYoo))
          .status;

        if (status === 'succeeded') {
          await this.paymentsRepository.insertPayYooInformation(
            payment.payIdYoo,
            payment.subscriptionTerm || 'month',
          );
          await this.paymentsRepository.insertUserPayYooInformation(
            payment.payIdYoo,
            payment.subscriptionTerm || 'month',
          );

          this.authClient.emit('payment_succeeded_yoo', {
            userId: payment.userId,
            type: 'Business',
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async checkSubscriptionsYoo() {
    const now = new Date();

    const subscriptions =
      await this.paymentsRepository.getActiveSubscriptionsYoo();

    for (const sub of subscriptions) {
      if (sub.autoPay === false) {
        continue;
      }
      const term = (sub.subscriptionTerm || 'month') as
        | '1day'
        | '7days'
        | 'month';

      const amount = sub.amount;
      const paymentMethodId = sub.IPaymentMethodData;

      try {
        const payments = await this.autoPayment(
          paymentMethodId,
          amount,
          term,
          sub.userId,
        );

        const newStart = now;
        const newEnd = new Date(newStart);

        switch (term) {
          case '1day':
            newEnd.setDate(newEnd.getDate() + 1);
            break;
          case '7days':
            newEnd.setDate(newEnd.getDate() + 7);
            break;
          case 'month':
            newEnd.setMonth(newEnd.getMonth() + 1);
            break;
          default:
            throw new Error('Неверный период подписки');
        }
        const updatedSubscriptionData: UpdatedSubscriptionDataT = {
          newStart,
          newEnd,
          payIdYoo: sub.payIdYoo,
        };

        await this.paymentsRepository.createPaymentsUserYoo({
          payIdYoo: payments.id,
          status: payments.status,
          amount: amount,
          IPaymentMethodData: payments.payment_method.type,
          subscriptionStart: updatedSubscriptionData.newStart,
          subscriptionTerm: term,
          userId: sub.userId,
        });
        await this.paymentsRepository.updateSubscriptionsYoo(
          updatedSubscriptionData,
        );
      } catch (error) {
        console.log(error);
      }
    }
  }
}
