import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { HttpStatusCode } from 'axios';
import { YooInputModel } from './models/input/yooPay-input.model';
import { JwtAccessAuthGuard } from 'apps/auth/guards/jwt/jwt-header.strategy';
import { TakeUserId } from 'apps/auth/decorators/authMeTakeUserId.decorator';
import { firstValueFrom } from 'rxjs';
import * as paypal from '@paypal/checkout-server-sdk';
import {
  exceptionHandler,
  ResultCode,
} from 'apps/auth/common/exception-filters/exception.handler';
import {
  buyPayPalEndpoint,
  buyYooEndpoint,
  cancelPayPalEndpoint,
  cancelYooEndpoint,
  getMyPaymentsEndpoint,
  getMyPaymentsPayPalEndpoint,
} from 'apps/auth/swagger/payments.swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PayPalInputModel } from './models/input/payPal-input.model';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsApiController {
  private clientPay: paypal.core.PayPalHttpClient;

  constructor(
    private commandBus: CommandBus,
    @Inject('PAYMENTS-SERVICE') private client: ClientProxy,
  ) {
    const environment = new paypal.core.SandboxEnvironment(
      'AW6UFq0_zfFfhaU0eOtUD9J7mxRv97pjFHo47-06-LlZsB_oUNf_ZtOVQPJ8E1BoQZLUQ83jQeYtMohI',
      'EKsJv3PrIvXA_wUbBXKE8dFcl1UiCgTl6ZMtsGC1g2E4cuHvr29fn-FoZ4almSiHUwQy6KJGT9Grzy7m',
    );
    this.clientPay = new paypal.core.PayPalHttpClient(environment);
  }

  @buyYooEndpoint()
  @Post('buyYoo')
  @UseGuards(ThrottlerGuard)
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatusCode.Created)
  async buyYoo(
    @Body() dto: YooInputModel,
    @TakeUserId() { userId }: { userId: number },
  ) {
    const pattern = 'buyYoo';
    dto.userID = userId;
    const result = await firstValueFrom(this.client.send(pattern, dto));

    if (!result.succeeded) {
      return exceptionHandler(
        ResultCode.ServerError,
        'error while making payment',
      );
    }

    return { redirectUrl: result.data };
  }

  @cancelYooEndpoint()
  @Post('cancelYoo')
  @UseGuards(JwtAccessAuthGuard)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatusCode.NoContent)
  async cancelAutoPaymentYoo(@TakeUserId() { userId }: { userId: number }) {
    const pattern = 'buyYooCancel';
    const result = await firstValueFrom(this.client.send(pattern, userId));

    if (!result.succeeded) {
      return exceptionHandler(
        ResultCode.ServerError,
        'error when cancel auto payments',
      );
    }
  }

  @getMyPaymentsEndpoint()
  @Get('myPaymentsYoo')
  @UseGuards(JwtAccessAuthGuard)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatusCode.Ok)
  async getMyPaymentsYoo(@TakeUserId() { userId }: { userId: number }) {
    const pattern = 'myPaymentsYoo';
    const result = await firstValueFrom(this.client.send(pattern, userId));

    if (!result.succeeded) {
      return exceptionHandler(ResultCode.ServerError, 'error get payment');
    }

    return result.data;
  }

  @buyPayPalEndpoint()
  @Post('buyPaypal')
  @UseGuards(ThrottlerGuard)
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatusCode.Created)
  async buyPaypal(
    @Body() dto: PayPalInputModel,
    @TakeUserId() { userId }: { userId: number },
  ) {
    const pattern = 'buyPaypal';
    dto.userID = userId;
    const result = await firstValueFrom(this.client.send(pattern, dto));

    if (!result.succeeded) {
      return exceptionHandler(
        ResultCode.ServerError,
        'error while making PayPal payment',
      );
    }

    return { redirectUrl: result.data };
  }

  @cancelPayPalEndpoint()
  @Post('cancelPaypal')
  @UseGuards(JwtAccessAuthGuard)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatusCode.NoContent)
  async cancelAutoPaymentPaypal(@TakeUserId() { userId }: { userId: number }) {
    const pattern = 'buyPaypalCancel';
    const result = await firstValueFrom(this.client.send(pattern, userId));

    if (!result.succeeded) {
      return exceptionHandler(
        ResultCode.ServerError,
        'error when cancel PayPal auto payments',
      );
    }
  }

  @getMyPaymentsPayPalEndpoint()
  @Get('myPaymentsPaypal')
  @UseGuards(JwtAccessAuthGuard)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatusCode.Ok)
  async getMyPaymentsPaypal(@TakeUserId() { userId }: { userId: number }) {
    const pattern = 'myPaymentsPaypal';
    const result = await firstValueFrom(this.client.send(pattern, userId));

    if (!result.succeeded) {
      return exceptionHandler(
        ResultCode.ServerError,
        'error get PayPal payment',
      );
    }

    return result.data;
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handlePaypalWebhook(@Body() webhookEvent: any) {
    try {
      console.log(webhookEvent, '=========stasrt=============');
      console.log(webhookEvent, 'aloooooooooooooooo');

      // Верификация вебхука
      // const verifyRequest = new paypal.webhooks.WebhookVerifySignatureRequest();
      // verifyRequest.requestBody({
      //   auth_algo: webhookEvent.auth_algo,
      //   cert_url: webhookEvent.cert_url,
      //   transmission_id: webhookEvent.transmission_id,
      //   transmission_sig: webhookEvent.transmission_sig,
      //   transmission_time: webhookEvent.transmission_time,
      //   webhook_id: 'WH-6J297149UT492630Y',
      //   webhook_event: webhookEvent,
      // });

      // const verification = await this.clientPay.execute(verifyRequest);
      // if (verification.result.verification_status !== 'SUCCESS') {
      //   console.error('Webhook verification failed');
      //   return { status: 'error', message: 'Invalid webhook signature' };
      // }

      // // Обработка события PAYMENT.CAPTURE.COMPLETED
      // if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      //   const orderId = webhookEvent.resource.id;
      //   const userId = webhookEvent.resource.custom_id; // Предполагается, что userId передается в custom_id при создании заказа

      //   // Отправляем событие в payments микросервис для обновления статуса
      //   // await firstValueFrom(
      //   //   this.client.emit('payment_succeeded_paypal', {
      //   //     userId: parseInt(userId, 10),
      //   //     type: 'premium',
      //   //     orderId,
      //   //   }),
      //   // );
      // }

      return { status: 'success' };
    } catch (error) {
      console.error('Error processing PayPal webhook:', error);
      return { status: 'error', message: 'Webhook processing failed' };
    }
  }
}
