import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { YooInputModel } from 'apps/auth/src/payments/api/models/input/yooPay-input.model';
import { PaymentsQueryRepository } from './infrastructure/payments-query.repository';
import { PaymentsYooService } from './application/payments.yoo.service';
import { PaymentsPaypalService } from './application/payments.payPal.service';
import { PayPalInputModel } from 'apps/auth/src/payments/api/models/input/payPal-input.model';

@Controller()
export class PaymentsController {
  constructor(
    protected paymentsYooService: PaymentsYooService,
    protected paymentsQueryRepository: PaymentsQueryRepository,
    protected paymentsPaypalService: PaymentsPaypalService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
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

  @MessagePattern('buyPaypalCancel')
  async cancelAutoPaymentPaypal(@Payload() userId: number) {
    const result = await this.paymentsPaypalService.cancelAutoPayment(userId);
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

      return {
        succeeded: true,
        message: '',
        data: {
          userId: userId,
          subscriptionStart: paymentList[0].subscriptionStart,
          subscription: paymentList[0].subscriptionEnd,
        },
      };
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
}
