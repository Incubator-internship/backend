import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { YooInputModel } from 'apps/auth/src/payments/api/models/input/yooPay-input.model';
import { PaymentsQueryRepository } from './infrastructure/payments-query.repository';
import { PaymentsYooService } from './application/payments.yoo.service';

@Controller()
export class PaymentsController {
  constructor(
    protected paymentsYooService: PaymentsYooService,
    protected paymentsQueryRepository: PaymentsQueryRepository,
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
}
