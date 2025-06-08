import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
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
  buyYooEndpoint,
  cancelYooEndpoint,
  getMyPaymentsEndpoint,
} from 'apps/auth/swagger/payments.swagger';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateUserTypeCommand } from '../../users/application/use.cases/updateUserType.command';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DatateT } from '../types/types';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsApiController {
  constructor(
    private commandBus: CommandBus,
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

  @EventPattern('payment_succeeded_yoo')
  async handlePaymentSuccessYoo(@Payload() data: DatateT) {
    try {
      await this.commandBus.execute(
        new UpdateUserTypeCommand(data.userId, data.type),
      );
    } catch (error) {
      console.error('Error processing payment_succeeded:', error);
    }
  }
}
