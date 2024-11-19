import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  InputCodeModel,
  InputEmailModel,
  InputNewPasswordModel,
  InputPasswordRecoveryModel,
  RegistrationInputUserModel,
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
import { RefreshPayload } from '../../../decorators/accessPayload.decorator';
import { FindSessionByUserIdAndDeviceIdCommand } from '../../devices/application/use.cases/findSessionByUserIdAndDeviceId.command';
import { DeleteSessionCommand } from '../../devices/application/use.cases/deleteSession.command';
import { JwtRefreshAuthGuard } from '../../../guards/jwt/jwt-cookie.strategy';
import { UpdateSessionCommand } from '../../devices/application/use.cases/updateSession.command';
import { JwtAccessAuthGuard } from '../../../guards/jwt/jwt-header.strategy';
import { TakeUserId } from '../../../decorators/authMeTakeUserId.decorator';
import { UsersQueryRepository } from '../../users/infrastructure/users-query.repository';
import { GoogleOAuthGuard } from '../../../guards/oath/google.strategy';
import { ApiTags } from '@nestjs/swagger';
import {
  AuthMeEndpoint,
  LoginUserEndpoint,
  LogoutEndpoint,
  NewPasswordEndpoint,
  PasswordRecoveryEndpoint,
  RefreshTokenEndpoint,
  RegConfirmationEndpoint,
  RegEmailResendingEndpoint,
  RegistrationUserEndpoint,
} from '../../../swagger/oauth.swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private jwtService: JWTService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @RegistrationUserEndpoint()
  @HttpCode(204)
  @Post('registration')
  async registration(@Body() registrationDTO: RegistrationInputUserModel) {
    await this.commandBus.execute(new RegistrationUserCommand(registrationDTO));
  }

  @LoginUserEndpoint()
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

  @RegEmailResendingEndpoint()
  @HttpCode(204)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() email: InputEmailModel) {
    await this.commandBus.execute(
      new RegistrationEmailResendingCommand(email.email),
    );
  }

  @RegConfirmationEndpoint()
  @HttpCode(204)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() confirmationCode: InputCodeModel) {
    await this.commandBus.execute(
      new RegistrationConfirmationCommand(confirmationCode.code),
    );
  }

  @PasswordRecoveryEndpoint()
  @HttpCode(204)
  @Post('password-recovery')
  async passwordRecovery(@Body() email: InputPasswordRecoveryModel) {
    await this.commandBus.execute(new PasswordRecoveryCommand(email.email));
  }

  @NewPasswordEndpoint()
  @HttpCode(204)
  @Post('new-password')
  async newPassword(@Body() newPasswordModel: InputNewPasswordModel) {
    await this.commandBus.execute(new NewPasswordCommand(newPasswordModel));
  }

  @LogoutEndpoint()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(
    @Req() req,
    @RefreshPayload()
    { userId, deviceId }: { userId: number; deviceId: string },
  ) {
    console.log(req.headers);
    console.log(req.cookies);
    console.log(req.cookies?.['refreshToken']);
    const session = await this.commandBus.execute(
      new FindSessionByUserIdAndDeviceIdCommand(userId, deviceId),
    );
    //todo значит надо найти сессию по девайс айди и проверить есть ли она и моя ли она
    if (!session) {
      throw new UnauthorizedException();
    }
    await this.commandBus.execute(new DeleteSessionCommand(userId, deviceId));
  }

  @RefreshTokenEndpoint()
  @HttpCode(200)
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-token')
  async refreshTokens(
    @RefreshPayload()
    { userId, deviceId }: { userId: number; deviceId: string },
    @Res({ passthrough: true })
    res: Response,
  ) {
    const tokensPair = await this.jwtService.createJWT(userId, deviceId);
    await this.commandBus.execute(
      new UpdateSessionCommand(userId, deviceId, tokensPair.refreshToken),
    );
    res.cookie('refreshToken', tokensPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokensPair.accessToken };
  }

  @AuthMeEndpoint()
  @UseGuards(JwtAccessAuthGuard)
  @Get('me')
  async authMe(@TakeUserId() { userId }: { userId: number }) {
    const authMe = await this.usersQueryRepository.getUserByIdForAuthMe(userId);
    if (!authMe) {
      throw new NotFoundException();
    }
    return authMe;
  }

  //----------------------------------
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Req() req) {
    //console.log(req);
    //return this.appService.googleLogin(req);
  }
}
