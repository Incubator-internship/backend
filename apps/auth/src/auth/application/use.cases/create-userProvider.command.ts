import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersProvidersRepository } from '../../../users/infrastructure/users-providers.repository';
import { CreateUserProviderDTO } from '../../../users/api/models/input/users-providers.types';

export class CreateUserProviderCommand {
  constructor(public readonly providerDTO: CreateUserProviderDTO) {}
}

@CommandHandler(CreateUserProviderCommand)
export class CreateUserProviderHandler
  implements ICommandHandler<CreateUserProviderCommand>
{
  constructor(private usersProvidersRepository: UsersProvidersRepository) {}

  async execute(command: CreateUserProviderCommand) {
    await this.usersProvidersRepository.createUserProvider({
      userId: command.providerDTO.userId,
      providerId: command.providerDTO.providerId,
      providerType: command.providerDTO.providerType,
    });
  }
}
