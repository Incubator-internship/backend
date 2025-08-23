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
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import {
  AuthMeEndpoint,
  GitHubUrl,
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
import { GoogleAuthInformation } from '../../../decorators/googleAuthInformation.decorator';
import { GoogleAuthCommand } from '../application/use.cases/google-auth.command';
import { AuthConfig } from '../../../settings/auth.config';
import {
  exceptionHandler,
  ResultCode,
} from 'apps/auth/common/exception-filters/exception.handler';
import { AuthService } from '../application/auth.service';
import { GitHubOAuthGuard } from 'apps/auth/guards/oath/github.strategy';
import { GitHubAuthInformation } from 'apps/auth/decorators/gitHubAuthInformation.decorator';
import { GitHubAuthCommand } from '../application/use.cases/github-auth.command';

@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private jwtService: JWTService,
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
    private authConfig: AuthConfig,
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
    @Req() req: Request,
  ) {
    const deviceId = randomUUID();
    const tokensPair = await this.jwtService.createJWT(userId, deviceId);
    const validatedTimezone = (req.headers['x-timezone'] as string) || 'UTC';
    await this.commandBus.execute(
      new CreateDeviceSessionCommand(
        tokensPair.refreshToken,
        deviceName,
        ip,
        validatedTimezone,
      ),
    );
    res.cookie('refreshToken', tokensPair.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
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
  //@UseGuards(RecaptchaAuthGuard)
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
    @Res({ passthrough: true }) res: Response,
    @Req() req,
    @RefreshPayload()
    { userId, deviceId }: { userId: number; deviceId: string },
  ) {
    const session = await this.commandBus.execute(
      new FindSessionByUserIdAndDeviceIdCommand(userId, deviceId),
    );
    //todo значит надо найти сессию по девайс айди и проверить есть ли она и моя ли она
    if (!session) {
      throw new UnauthorizedException();
    }
    res.clearCookie('refreshToken');
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
      sameSite: 'none',
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

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(
    @Ip() ip: string,
    @GoogleAuthInformation()
    googleInfo: { email: string; providerId: string; providerType: string },
    @Req() req,
    @UserAgent() deviceName: string,
    @Res({ passthrough: true })
    res: Response,
  ) {
    //return this.appService.googleLogin(req);
    const tokensPair = await this.commandBus.execute(
      new GoogleAuthCommand({ ...googleInfo, deviceName, ip }),
    );
    res.cookie('refreshToken', tokensPair.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    //todo delete after testing auth controller google-redirect check link from env
    //const redirectUrl = `http://localhost:3000/authentication?accessToken=${tokensPair.accessToken}`;
    const redirectUrl = `${this.authConfig.redirectUrlGoogleOauth}${tokensPair.accessToken}`;
    return res.redirect(redirectUrl);
  }

  @Get('github/callback')
  @UseGuards(GitHubOAuthGuard)
  @ApiExcludeEndpoint()
  async githubCallback(
    @Ip() ip: string,
    @Req() req,
    @GitHubAuthInformation()
    githubInfo: { email: string; providerId: string; providerType: string },
    @UserAgent() deviceName: string,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const tokensPair = await this.commandBus.execute(
      new GitHubAuthCommand({ ...githubInfo, deviceName, ip }),
    );
    res.cookie('refreshToken', tokensPair.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    const redirectUrl = `${this.authConfig.redirectUrlGoogleOauth}${tokensPair.accessToken}`;
    return res.redirect(redirectUrl);
  }

  @GitHubUrl()
  @Get('github')
  @HttpCode(302)
  async gitOauthGitHub(@Res() res: Response) {
    const result = await this.authService.getOauthGitHub();

    if (!result.success) {
      return exceptionHandler(ResultCode.ServerError, `${result.message}`);
    }
    if (!result.data) {
      return exceptionHandler(
        ResultCode.ServerError,
        'Authorization URL not found',
      );
    }
    return res.redirect(result.data.authUrl);
  }
}
