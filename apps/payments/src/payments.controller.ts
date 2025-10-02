import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { YooInputModel } from 'apps/auth/src/payments/api/models/input/yooPay-input.model';
import { PaymentsQueryRepository } from './infrastructure/payments-query.repository';
import { PaymentsYooService } from './api/payments.yoo.service';
import { PaymentsPaypalService } from './api/payments.payPal.service';
import { PayPalInputModel } from 'apps/auth/src/payments/api/models/input/payPal-input.model';
import { DateTime } from 'luxon';

@Controller()
export class PaymentsController {
  constructor(
    protected paymentsYooService: PaymentsYooService,
    protected paymentsQueryRepository: PaymentsQueryRepository,
    protected paymentsPaypalService: PaymentsPaypalService,
  ) {}

  @MessagePattern('buyYoo')
  async buyYou(@Payload() yooInputModel: YooInputModel) {
    const redirectUrl = await this.paymentsYooService.buyYou(yooInputModel);

    if (!redirectUrl.succeeded) {
      return {
        succeeded: false,
        message: '',
        data: {},
      };
    }

    return {
      succeeded: true,
      message: '',
      data: redirectUrl.data,
    };
  }

  @MessagePattern('buyYooCancel')
  async cancelAutoPaymentYoo(userId: number) {
    const result = await this.paymentsYooService.cancelAutoPayment(userId);
    if (!result.succeeded) {
      return {
        succeeded: false,
        message: '',
        data: {},
      };
    }

    return {
      succeeded: true,
      message: '',
      data: {},
    };
  }

  @MessagePattern('myPaymentsYoo')
  async getPayYooInformation(userId: number) {
    try {
      const paymentList =
        await this.paymentsQueryRepository.getUserPaymentHistory(userId);

      return {
        succeeded: true,
        message: '',
        data: paymentList,
      };
    } catch (error) {
      return {
        succeeded: false,
        message: '',
        data: {},
      };
    }
  }
  @MessagePattern('buyPaypal')
  async buyPaypal(@Payload() paypalInputModel: PayPalInputModel) {
    let planId = '';
    switch (paypalInputModel.value) {
      case '100.00':
        planId = 'P-3FV91190N57053939NC555NY';
        break;
      case '50.00':
        planId = 'P-1AF62965E2633264ENC555XA';
        break;
      case '10.00':
        planId = 'P-34T904862D4239434NC5553Y';
        break;
    }

    const redirectUrl = await this.paymentsPaypalService.createSubscription(
      planId,
      'https://excubator.xyz/profile-settings?success=true',
      'https://excubator.xyz/profile-settings?success=false',
      paypalInputModel,
    );

    return {
      succeeded: redirectUrl.succeeded,
      message: redirectUrl.message || '',
      data: redirectUrl.data,
    };
  }

  @MessagePattern('toggleAutoPay')
  async cancelAutoPaymentPaypal(@Payload() dto: any) {
    const result = await this.paymentsPaypalService.toggleAutoPayPaypal(
      dto.userId,
      dto.enable,
    );
    return {
      succeeded: result.succeeded,
      message: result.message || '',
      data: result.data,
    };
  }

  @MessagePattern('myPaymentsPaypal')
  async getPayPalInformation(@Payload() userId: number) {
    try {
      const payment =
        await this.paymentsQueryRepository.getPayPalInformationByUserId(userId);

      const transactions =
        await this.paymentsPaypalService.getSubscriptionTransactions(
          payment!.payIdPal,
          payment!.createdAt,
        );

      let data = [];
      if (transactions.data.length > 0) {
        data = transactions.data.map((el) => {
          return {
            userId: payment?.userId,
            payid: el.id,
            payIdPayPal: payment?.payIdPal,
            status: el.status,
            amount: el.amount_with_breakdown.gross_amount.value,
            IPaymentMethodData: 'paypal',
            subscriptionStart: payment?.subscriptionStart,
            subscriptionTerm: payment?.subscriptionTerm,
          };
        });
      }

      return {
        succeeded: true,
        message: '',
        data: data,
      };
    } catch (error) {
      return {
        succeeded: false,
        message: 'Error fetching PayPal payments',
        data: {},
      };
    }
  }
  @MessagePattern('myActiveSubscription')
  async getActiveSubscription(@Payload() userId: number) {
    try {
      const paymentList =
        await this.paymentsQueryRepository.getActiveSubscription(userId);

      if (!paymentList[0].subscriptionEnd || !paymentList[0].timezone) {
        throw new Error();
      }
      const result = await this.paymentsPaypalService.getSubscription(
        paymentList[0].payIdPal,
      );

      const expireAt = DateTime.fromJSDate(paymentList[0].subscriptionEnd, {
        zone: 'UTC',
      }).setZone(paymentList[0].timezone, { keepLocalTime: true });
      const data = {
        userId: userId,
        subscriptionStart: paymentList[0].subscriptionStart,
        ExpireAt: expireAt,
        nextPayment: result.data.billing_info.next_billing_time,
        autoPay: paymentList[0].autoPay,
      };
      return data;
    } catch (error) {
      return {
        succeeded: false,
        message: 'Error fetching PayPal payments',
        data: {},
      };
    }
  }

  @MessagePattern('getSubscriptionDetails')
  async getSubscriptionDetails(@Payload() userId: number) {
    try {
      const paymentList =
        await this.paymentsQueryRepository.getActiveSubscription(userId);

      if (paymentList.length > 0) {
        return {
          subscriptionTerm: paymentList[0].subscriptionTerm,
          amount: paymentList[0].amount,
        };
      }
      return {
        succeeded: false,
        message: 'no payments',
        data: {},
      };
    } catch (error) {
      return {
        succeeded: false,
        message: 'Error fetching PayPal payments',
        data: {},
      };
    }
  }
}
