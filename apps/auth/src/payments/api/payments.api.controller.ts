import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HttpStatusCode } from 'axios';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { YooInputModel } from './models/input/yooPay-input.model';
import { JwtAccessAuthGuard } from 'apps/auth/guards/jwt/jwt-header.strategy';
import { TakeUserId } from 'apps/auth/decorators/authMeTakeUserId.decorator';
import { firstValueFrom } from 'rxjs';
import {
  exceptionHandler,
  ResultCode,
} from 'apps/auth/common/exception-filters/exception.handler';
import {
  buyYooEndpoint,
  cancelYooEndpoint,
  getMyPaymentsEndpoint,
} from 'apps/auth/swagger/oauth.swagger';

@ApiTags('Payments')
@UseGuards(ThrottlerGuard)
@Controller('payments')
export class PaymentsApiController {
  constructor(@Inject('PAYMENTS-SERVICE') private client: ClientProxy) {}

  @buyYooEndpoint()
  @Post('buyYoo')
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatusCode.Created)
  async buy(
    @Body() YooInputModel: YooInputModel,
    @TakeUserId() { userId }: { userId: number },
  ) {
    const pattern = 'buyYoo';
    YooInputModel.userID = userId;
    const result = await firstValueFrom(
      this.client.send(pattern, YooInputModel),
    );

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
  @HttpCode(HttpStatusCode.NoContent)
  async cancelAutoPayment(@TakeUserId() { userId }: { userId: number }) {
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
  @HttpCode(HttpStatusCode.Ok)
  async getMyPayments(@TakeUserId() { userId }: { userId: number }) {
    const pattern = 'myPaymentsYoo';
    const result = await firstValueFrom(this.client.send(pattern, userId));

    if (!result.succeeded) {
      return exceptionHandler(ResultCode.ServerError, 'error get payment');
    }

    return result.data;
  }
}
