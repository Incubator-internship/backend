import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateUserTypeCommand } from '../../users/application/use.cases/updateUserType.command';

@Controller()
export class PaymentsEventsHandler {
  constructor(private commandBus: CommandBus) {}

  @EventPattern('payment_change_status')
  async handlePaymentStatusChanged(
    @Payload()
    data: any,
  ) {
    console.log('fdsfsdfsdfsd', data);
    try {
      await this.commandBus.execute(
        new UpdateUserTypeCommand(
          data.userId,
          data.type,
          data.term,
          data.amount,
        ),
      );
    } catch (error) {
      console.error('Error handling payment_change_status:', error);
    }
  }
}
