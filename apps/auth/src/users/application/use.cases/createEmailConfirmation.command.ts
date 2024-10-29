import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailConfirmation } from '../../domain/createEmailConfirmation.model';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

export class CreateEmailConfirmationCommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(CreateEmailConfirmationCommand)
export class CreateEmailConfirmationHandler
  implements ICommandHandler<CreateEmailConfirmationCommand>
{
  constructor() {}

  async execute(command: CreateEmailConfirmationCommand) {
    const confirmationCode = randomUUID();
    const expirationDate = add(new Date(), {
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
    const isConfirmed = false;

    EmailConfirmation.createEmailConfirmation(
      confirmationCode,
      expirationDate,
      isConfirmed,
      command.userId,
    );

    return confirmationCode;
  }
}
