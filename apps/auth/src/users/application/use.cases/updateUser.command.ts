import { RegistrationInputUserModel } from '../../../auth/api/models/input/auth-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { hash } from 'bcryptjs';
import {
  CreateUserProviderCommand,
  CreateUserProviderHandler,
} from '../../../auth/application/use.cases/create-userProvider.command';

export class UpdateUserCommand {
  constructor(public readonly registrationDTO: RegistrationInputUserModel) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private userRepository: UsersRepository,
    private createUserProviderHandler: CreateUserProviderHandler,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const passwordHash = await hash(command.registrationDTO.password, 10);
    const updateUserDTO = {
      email: command.registrationDTO.email,
      userName: command.registrationDTO.userName,
      passwordHash,
    };
    const updatedUserId = await this.userRepository.updateUser(updateUserDTO);
    const providerDTO = {
      userId: updatedUserId,
      providerId: 'registration by email',
      providerType: 'email',
    };
    await this.createUserProviderHandler.execute(
      new CreateUserProviderCommand(providerDTO),
    );
  }
}
