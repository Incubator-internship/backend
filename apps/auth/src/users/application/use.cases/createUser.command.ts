import { RegistrationUserModel } from '../../../auth/api/models/input/auth-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserModel } from '../../domain/createUser.model';
import {
  CreateEmailConfirmationCommand,
  CreateEmailConfirmationHandler,
} from './createEmailConfirmation.command';
import { hash } from 'bcryptjs';

export class CreateUserCommand {
  constructor(public readonly registrationDTO: RegistrationUserModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private userRepository: UsersRepository,
    private createEmailConfirmationHandler: CreateEmailConfirmationHandler,
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
    const confirmationCode = await this.createEmailConfirmationHandler.execute(
      new CreateEmailConfirmationCommand(userId),
    );
    return { userId, confirmationCode };
    //next steps
    // const emailConfirmation = EmailConfirmation.createEmailConfirmation(userId);
    // await this.usersRepository.saveEmailConfirmation(emailConfirmation);
    // return userId;
  }
}
