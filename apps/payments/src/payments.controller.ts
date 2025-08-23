import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { YooInputModel } from 'apps/auth/src/payments/api/models/input/yooPay-input.model';
import { PaymentsQueryRepository } from './infrastructure/payments-query.repository';
import { PaymentsYooService } from './api/payments.yoo.service';
import { PaymentsPaypalService } from './api/payments.payPal.service';
import { PayPalInputModel } from 'apps/auth/src/payments/api/models/input/payPal-input.model';

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
    const redirectUrl =
      await this.paymentsPaypalService.buyPaypal(paypalInputModel);

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
      const paymentList =
        await this.paymentsQueryRepository.getUserPaymentHistory(userId);

      return {
        succeeded: true,
        message: '',
        data: paymentList.filter(
          (payment) => payment.IPaymentMethodData === 'paypal',
        ),
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

      const resultCalculateSubscriptionDates =
        await this.paymentsPaypalService.calculateSubscriptionDates(
          paymentList[0],
        );

      const data = {
        userId: userId,
        subscriptionStart: paymentList[0].subscriptionStart,
        ExpireAt: resultCalculateSubscriptionDates.expireAt,
        nextPayment: resultCalculateSubscriptionDates.nextPayment,
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

  @MessagePattern('autoRenewEnable')
  async autoRenewEnable(@Payload() userId: number) {
    try {
      await this.paymentsPaypalService.autoRenewEnable(userId);

      return {
        succeeded: true,
        message: '',
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
