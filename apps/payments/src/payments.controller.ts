import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { YooInputModel } from 'apps/auth/src/payments/api/models/input/yooPay-input.model';
import { PaymentsQueryRepository } from './infrastructure/payments-query.repository';
import { PaymentsService } from './application/payments.service';

@Controller()
export class PaymentsController {
  constructor(
    protected paymentsService: PaymentsService,
    protected paymentsQueryRepository: PaymentsQueryRepository,
  ) {}

  @MessagePattern('buyYoo')
  async buyYou(@Payload() yooInputModel: YooInputModel) {
    const redirectUrl = await this.paymentsService.buyYou(yooInputModel);

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
  async cancelAutoPayment(userId: number) {
    const result = await this.paymentsService.cancelAutoPayment(userId);
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
  async getPayInformation(userId: number) {
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
