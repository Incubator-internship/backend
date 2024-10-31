import {
  Body,
  Controller,
  HttpCode,
  Ip,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  LoginInputModelType,
  RegistrationUserModel,
} from './models/input/auth-input.model';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationUserCommand } from '../application/use.cases/registrationUser.command';
import { randomUUID } from 'crypto';
import { LoginGuard } from '../../../guards/local/local.strategy';
import { UserAgent } from '../../../decorators/userAgent.decorator';
import { CurrentUserId } from '../../../decorators/currentUserId.decorator';
import { JWTService } from '../../../common/jwt/jwt.service';
import { CreateDeviceSessionCommand } from '../../devices/application/use.cases/createDeviceSession.command';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private jwtService: JWTService,
  ) {}

  @HttpCode(204)
  @Post('registration')
  async registration(@Body() registrationDTO: RegistrationUserModel) {
    await this.commandBus.execute(new RegistrationUserCommand(registrationDTO));
  }

  @HttpCode(200)
  @UseGuards(LoginGuard)
  @UsePipes(new ValidationPipe())
  @Post('login')
  async signIn(
    @Body() loginDTO: LoginInputModelType,
    @UserAgent() deviceName: string,
    @CurrentUserId() userId: string,
    @Ip() ip: string,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const deviceId = randomUUID();
    const tokensPair = await this.jwtService.createJWT(userId, deviceId);
    await this.commandBus.execute(
      new CreateDeviceSessionCommand(tokensPair.refreshToken, deviceName, ip),
    );
    res.cookie('refreshToken', tokensPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokensPair.accessToken };
  }
}
