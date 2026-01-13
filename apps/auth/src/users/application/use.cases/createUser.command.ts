import { RegistrationInputUserModel } from '../../../auth/api/models/input/auth-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserModel } from '../../domain/createUser.model';
import {
  CreateEmailConfirmationCommand,
  CreateEmailConfirmationHandler,
} from './createEmailConfirmation.command';
import { hash } from 'bcryptjs';
import {
  CreateUserProviderCommand,
  CreateUserProviderHandler,
} from '../../../auth/application/use.cases/create-userProvider.command';

export class CreateUserCommand {
  constructor(public readonly registrationDTO: RegistrationInputUserModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private userRepository: UsersRepository,
    private createEmailConfirmationHandler: CreateEmailConfirmationHandler,
    private createUserProviderHandler: CreateUserProviderHandler,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<{ userId: number; confirmationCode: string }> {
    const passwordHash = await hash(command.registrationDTO.password, 10);
    const newUser = UserModel.createUser(
      command.registrationDTO.userName,
      command.registrationDTO.email,
      passwordHash,
    );
    const userId = await this.userRepository.createUser(newUser);
    const providerDTO = {
      userId,
      providerId: 'registration by email',
      providerType: 'email',
    };
    await this.createUserProviderHandler.execute(
      new CreateUserProviderCommand(providerDTO),
    );
    const confirmationCode = await this.createEmailConfirmationHandler.execute(
      new CreateEmailConfirmationCommand(userId),
    );
    return { userId, confirmationCode };
  }
}
