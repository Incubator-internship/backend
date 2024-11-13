import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtRefreshAuthGuard } from '../../../guards/jwt/jwt-cookie.strategy';
import { RefreshPayload } from '../../../decorators/accessPayload.decorator';
import { SessionsQueryRepository } from '../infrastructure/sessions-query.repository';
import { DeleteSessionExceptThisCommand } from '../application/use.cases/deleteSessiomsDevicesExceptThisOne.command';
import { DeleteDeviceSessionCommand } from '../application/use.cases/deleteDeviceSession.command';

@Controller('security')
export class SecurityDevicesController {
  constructor(
    private commandBus: CommandBus,
    private sessionsQueryRepository: SessionsQueryRepository,
  ) {}

  @HttpCode(200)
  @UseGuards(JwtRefreshAuthGuard)
  @Get('devices')
  async getAllDevices(
    @RefreshPayload()
    { userId }: { userId: number },
  ) {
    return await this.sessionsQueryRepository.findAllSessionsByUserId(userId);
  }

  @HttpCode(204)
  @UseGuards(JwtRefreshAuthGuard)
  @Delete('devices')
  async deleteDevicesExceptThis(
    @RefreshPayload()
    { userId, deviceId }: { userId: number; deviceId: string },
  ) {
    await this.commandBus.execute(
      new DeleteSessionExceptThisCommand(userId, deviceId),
    );
  }

  @HttpCode(204)
  @UseGuards(JwtRefreshAuthGuard)
  @Delete('devices/:deviceId')
  async deleteSessionDevice(
    @Param('deviceId') deviceId: string,
    @RefreshPayload()
    { userId }: { userId: number },
  ) {
    /* const result = */ await this.commandBus.execute(
      new DeleteDeviceSessionCommand(userId, deviceId),
    );
    // if (result.status === 'NotFound') {
    //   throw new NotFoundException();
    // }
    // if (result.status === 'Forbidden') {
    //   throw new ForbiddenException();
    // }
  }
}
