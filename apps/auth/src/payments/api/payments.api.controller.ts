import {
  Body,
  Controller,
  Get,
  Headers,
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
import { PaypalClientService } from '../application/paypal.client.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsApiController {
  constructor(
    private commandBus: CommandBus,
    private paypalClientService: PaypalClientService,
    @Inject('PAYMENTS-SERVICE') private client: ClientProxy,
  ) {}

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
  async handlePaypalWebhook(
    @Body() webhookEvent: any,
    @Headers() headers: Record<string, string>,
  ) {
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl = headers['paypal-cert-url'];
    const authAlgo = headers['paypal-auth-algo'];
    const transmissionSig = headers['paypal-transmission-sig'];

    console.log('==================start====================');
    console.log(
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
    );
  }
}
