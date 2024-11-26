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
    }
  }
}
