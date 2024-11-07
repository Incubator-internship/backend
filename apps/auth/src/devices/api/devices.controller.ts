import { Controller, Get, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtRefreshAuthGuard } from '../../../guards/jwt/jwt-cookie.strategy';
import { RefreshPayload } from '../../../decorators/accessPayload.decorator';
import { SessionsQueryRepository } from '../infrastructure/sessions-query.repository';

@Controller('security')
export class SecurityDevicesController {
  constructor(
    private commandBus: CommandBus,
    private sessionsQueryRepository: SessionsQueryRepository,
  ) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Get('devices')
  async getAllDevices(
    @RefreshPayload()
    { userId }: { userId: number },
  ) {
    return await this.sessionsQueryRepository.findAllSessionsByUserId(userId);
  }
}
