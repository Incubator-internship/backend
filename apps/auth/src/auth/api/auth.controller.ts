import {
  Body,
  Controller,
  HttpCode,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  InputCodeModel,
  InputEmailModel,
  InputNewPasswordModel,
  InputPasswordRecoveryModel,
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
import { RegistrationEmailResendingCommand } from '../application/use.cases/registrationEmailResending.command';
import { RegistrationConfirmationCommand } from '../application/use.cases/registrationConfirmation.command';
import { PasswordRecoveryCommand } from '../application/use.cases/passwordRecovery.command';
import { NewPasswordCommand } from '../application/use.cases/newPassword.command';
import { JwtRefreshAuthGuard } from '../../../guards/jwt/jwt-cookie.strategy';
import { RefreshPayload } from '../../../decorators/accessPayload.decorator';
import { FindSessionByUserIdAndDeviceIdCommand } from '../../devices/application/use.cases/findSessionByUserIdAndDeviceId.command';
import { DeleteSessionCommand } from '../../devices/application/use.cases/deleteSession.command';

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
  //@UsePipes(new ValidationPipe())
  @Post('login')
  async signIn(
    //@Body() loginDTO: LoginInputModelType,
    @UserAgent() deviceName: string,
    @CurrentUserId() userId: number,
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

  @HttpCode(204)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() email: InputEmailModel) {
    await this.commandBus.execute(
      new RegistrationEmailResendingCommand(email.email),
    );
  }

  @HttpCode(204)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() confirmationCode: InputCodeModel) {
    await this.commandBus.execute(
      new RegistrationConfirmationCommand(confirmationCode.code),
    );
  }

  @HttpCode(204)
  @Post('password-recovery')
  async passwordRecovery(@Body() email: InputPasswordRecoveryModel) {
    await this.commandBus.execute(new PasswordRecoveryCommand(email.email));
  }

  @HttpCode(204)
  @Post('new-password')
  async newPassword(@Body() newPasswordModel: InputNewPasswordModel) {
    await this.commandBus.execute(new NewPasswordCommand(newPasswordModel));
  }

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(
    @RefreshPayload()
    { userId, deviceId }: { userId: number; deviceId: string },
  ) {
    const session = await this.commandBus.execute(
      new FindSessionByUserIdAndDeviceIdCommand(userId, deviceId),
    );
    if (!session) {
      throw new UnauthorizedException();
    }
    await this.commandBus.execute(new DeleteSessionCommand(userId, deviceId));
  }
}
