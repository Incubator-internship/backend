import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UsersProvidersRepository } from '../../../users/infrastructure/users-providers.repository';
import { randomUUID } from 'crypto';
import { JWTService } from '../../../../common/jwt/jwt.service';
import {
  CreateDeviceSessionCommand,
  CreateDeviceSessionHandler,
} from '../../../devices/application/use.cases/createDeviceSession.command';
import { GoogleAuthCommandDTO } from '../../api/models/input/googleAuth-input.model';
import {
  CreateUserProviderCommand,
  CreateUserProviderHandler,
} from './create-userProvider.command';
import {
  CreateUserAndProviderCommand,
  CreateUserAndProviderHandler,
} from 'apps/auth/src/users/application/use.cases/createUser-provider.command';

export class GoogleAuthCommand {
  constructor(public readonly googleDTO: GoogleAuthCommandDTO) {}
}

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler implements ICommandHandler<GoogleAuthCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private usersProvidersRepository: UsersProvidersRepository,
    private jwtService: JWTService,
    private createDeviceSessionHandler: CreateDeviceSessionHandler,
    private createUserProviderHandler: CreateUserProviderHandler,
    private createUserAndProviderHandler: CreateUserAndProviderHandler,
  ) {}

  async execute(command: GoogleAuthCommand) {
    const googleProvider =
      await this.usersProvidersRepository.findProviderByProviderId(
        command.googleDTO.providerId,
      );

    if (googleProvider) {
      const deviceId = randomUUID();
      const tokensPair = await this.jwtService.createJWT(
        googleProvider.userId,
        deviceId,
      );
      await this.createDeviceSessionHandler.execute(
        new CreateDeviceSessionCommand(
          tokensPair.refreshToken,
          command.googleDTO.deviceName,
          command.googleDTO.ip,
        ),
      );
      return tokensPair;
    }

    const user = await this.usersRepository.findUserByEmail(
      command.googleDTO.email,
    );
    if (user) {
      await this.createUserProviderHandler.execute(
        new CreateUserProviderCommand({
          userId: user.id,
          providerId: command.googleDTO.providerId,
          providerType: command.googleDTO.providerType,
        }),
      );
      const deviceId = randomUUID();
      const tokensPair = await this.jwtService.createJWT(user.id, deviceId);
      await this.createDeviceSessionHandler.execute(
        new CreateDeviceSessionCommand(
          tokensPair.refreshToken,
          command.googleDTO.deviceName,
          command.googleDTO.ip,
        ),
      );
      return tokensPair;
    }
    if (!user) {
      const password = randomUUID();
      const emailPrefix = command.googleDTO.email.split('@')[0];
      const timeStampSuffix = Date.now().toString().slice(-6);
      const userName = emailPrefix + timeStampSuffix;
      const userId = await this.createUserAndProviderHandler.execute(
        new CreateUserAndProviderCommand({
          userName,
          password,
          email: command.googleDTO.email,
          providerId: command.googleDTO.providerId,
          providerType: command.googleDTO.providerType,
        }),
      );
      const deviceId = randomUUID();
      const tokensPair = await this.jwtService.createJWT(userId, deviceId);
      await this.createDeviceSessionHandler.execute(
        new CreateDeviceSessionCommand(
          tokensPair.refreshToken,
          command.googleDTO.deviceName,
          command.googleDTO.ip,
        ),
      );
      return tokensPair;
    }
  }
}
