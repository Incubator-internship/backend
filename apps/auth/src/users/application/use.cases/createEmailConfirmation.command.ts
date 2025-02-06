import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailConfirmationModel } from '../../domain/createEmailConfirmation.model';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { EmailConfirmationRepository } from '../../infrastructure/emailConfirmation.repository';
import { AuthConfig } from '../../../../settings/auth.config';

export class CreateEmailConfirmationCommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(CreateEmailConfirmationCommand)
export class CreateEmailConfirmationHandler
  implements ICommandHandler<CreateEmailConfirmationCommand>
{
  constructor(
    private emailConfirmation: EmailConfirmationRepository,
    private authConfig: AuthConfig,
  ) {}

  async execute(command: CreateEmailConfirmationCommand) {
    const confirmationCode = randomUUID();
    const expirationDate = add(new Date(), {
      minutes: 5,
    });
    const isConfirmed = this.authConfig.isAutomaticallyConfirmedUser;

    const emailConfirmationDTO = EmailConfirmationModel.createEmailConfirmation(
      confirmationCode,
      expirationDate,
      isConfirmed,
      command.userId,
    );
    await this.emailConfirmation.createEmailConfirmation(emailConfirmationDTO);
    return confirmationCode;
  }
}
