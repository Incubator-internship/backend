import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class UpdateUserTypeCommand {
  constructor(
    public userId: number,
    public type: string,
    public term: string,
    public amount: string,
  ) {}
}

@CommandHandler(UpdateUserTypeCommand)
export class UpdateUserTypeHandler
  implements ICommandHandler<UpdateUserTypeCommand>
{
  constructor(private userRepository: UsersRepository) {}

  async execute(data: UpdateUserTypeCommand): Promise<void> {
    await this.userRepository.updateUserType(
      data.type,
      data.userId,
      data.term,
      data.amount,
    );
  }
}
