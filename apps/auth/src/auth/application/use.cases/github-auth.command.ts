import { GoogleAuthCommandDTO } from '../../api/models/input/googleAuth-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UsersProvidersRepository } from '../../../users/infrastructure/users-providers.repository';
import { JWTService } from '../../../../common/jwt/jwt.service';
import {
  CreateDeviceSessionCommand,
  CreateDeviceSessionHandler,
} from '../../../devices/application/use.cases/createDeviceSession.command';
import {
  CreateUserProviderCommand,
  CreateUserProviderHandler,
} from './create-userProvider.command';
import {
  CreateUserAndProviderCommand,
  CreateUserAndProviderHandler,
} from '../../../users/application/use.cases/createUser-google.command';
import { randomUUID } from 'crypto';

export class GitHubAuthCommand {
  constructor(public readonly gitHubDTO: GoogleAuthCommandDTO) {}
}

@CommandHandler(GitHubAuthCommand)
export class GitHubAuthHandler implements ICommandHandler<GitHubAuthCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private usersProvidersRepository: UsersProvidersRepository,
    private jwtService: JWTService,
    private createDeviceSessionHandler: CreateDeviceSessionHandler,
    private createUserProviderHandler: CreateUserProviderHandler,
    private createUserAndProviderHandler: CreateUserAndProviderHandler,
  ) {}

  async execute(command: GitHubAuthCommand) {
    const gitHubProvider =
      await this.usersProvidersRepository.findProviderByProviderId(
        command.gitHubDTO.providerId,
      );

    if (gitHubProvider) {
      const deviceId = randomUUID();
      const tokensPair = await this.jwtService.createJWT(
        gitHubProvider.userId,
        deviceId,
      );
      await this.createDeviceSessionHandler.execute(
        new CreateDeviceSessionCommand(
          tokensPair.refreshToken,
          command.gitHubDTO.deviceName,
          command.gitHubDTO.ip,
        ),
      );
      return tokensPair;
    }

    const user = await this.usersRepository.findUserByEmail(
      command.gitHubDTO.email,
    );
    if (user) {
      await this.createUserProviderHandler.execute(
        new CreateUserProviderCommand({
          userId: user.id,
          providerId: command.gitHubDTO.providerId,
          providerType: command.gitHubDTO.providerType,
        }),
      );
      const deviceId = randomUUID();
      const tokensPair = await this.jwtService.createJWT(user.id, deviceId);
      await this.createDeviceSessionHandler.execute(
        new CreateDeviceSessionCommand(
          tokensPair.refreshToken,
          command.gitHubDTO.deviceName,
          command.gitHubDTO.ip,
        ),
      );
      return tokensPair;
    }
    if (!user) {
      const password = randomUUID();
      const emailPrefix = command.gitHubDTO.email.split('@')[0];
      const timeStampSuffix = Date.now().toString().slice(-6);
      const userName = emailPrefix + timeStampSuffix;
      const userId = await this.createUserAndProviderHandler.execute(
        new CreateUserAndProviderCommand({
          userName,
          password,
          email: command.gitHubDTO.email,
          providerId: command.gitHubDTO.providerId,
          providerType: command.gitHubDTO.providerType,
        }),
      );
      const deviceId = randomUUID();
      const tokensPair = await this.jwtService.createJWT(userId, deviceId);
      await this.createDeviceSessionHandler.execute(
        new CreateDeviceSessionCommand(
          tokensPair.refreshToken,
          command.gitHubDTO.deviceName,
          command.gitHubDTO.ip,
        ),
      );
      return tokensPair;
    }
  }
}
