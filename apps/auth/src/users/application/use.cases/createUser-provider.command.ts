import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserModel } from '../../domain/createUser.model';
import { hash } from 'bcryptjs';
import { CreateUserProviderModel } from '../../api/models/input/users-providers.types';
import { EmailConfirmationModel } from '../../domain/createEmailConfirmation.model';
import { EmailConfirmationRepository } from '../../infrastructure/emailConfirmation.repository';
import {
  CreateUserProviderCommand,
  CreateUserProviderHandler,
} from '../../../auth/application/use.cases/create-userProvider.command';

export class CreateUserAndProviderCommand {
  constructor(public readonly registrationDTO: CreateUserProviderModel) {}
}

@CommandHandler(CreateUserAndProviderCommand)
export class CreateUserAndProviderHandler
  implements ICommandHandler<CreateUserAndProviderCommand>
{
  constructor(
    private userRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
    private createUserProviderHandler: CreateUserProviderHandler,
  ) {}

  async execute(
    command: CreateUserAndProviderCommand,
  ): Promise<number> /*: Promise<{ userId: number; confirmationCode: string }> */ {
    const passwordHash = await hash(command.registrationDTO.password, 10);
    const newUser = UserModel.createUser(
      command.registrationDTO.userName,
      command.registrationDTO.email,
      passwordHash,
    );
    const userId = await this.userRepository.createUser(newUser);
    await this.createUserProviderHandler.execute(
      new CreateUserProviderCommand({
        userId,
        providerId: command.registrationDTO.providerId,
        providerType: command.registrationDTO.providerType,
      }),
    );
    const EmailConfirmationStatus =
      EmailConfirmationModel.createEmailConfirmation(
        'null',
        new Date(),
        true,
        userId,
      );
    await this.emailConfirmationRepository.createEmailConfirmation(
      EmailConfirmationStatus,
    );
    return userId;
  }
}
