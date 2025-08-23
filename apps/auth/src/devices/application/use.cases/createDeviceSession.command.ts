import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SessionModel } from '../../domain/createDeviceSession.model';

export class CreateDeviceSessionCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly deviceName: string,
    public readonly ip: string,
    public readonly timezone: string,
  ) {}
}

@CommandHandler(CreateDeviceSessionCommand)
export class CreateDeviceSessionHandler
  implements ICommandHandler<CreateDeviceSessionCommand>
{
  constructor(
    private sessionsRepository: SessionsRepository,
    private jwtService: JwtService,
  ) {}

  async execute(command: CreateDeviceSessionCommand): Promise<void> {
    const { refreshToken, deviceName, ip, timezone } = command;
    const { userId, deviceId, iat } = this.jwtService.decode(refreshToken);
    const issuedAt = new Date(iat * 1000).toISOString();
    const newSession = SessionModel.createDeviceSession(
      deviceId,
      ip,
      deviceName,
      userId,
      issuedAt,
      timezone,
    );

    await this.sessionsRepository.createDeviceSession(newSession);
  }
}
