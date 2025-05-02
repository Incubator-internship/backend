import { Module } from '@nestjs/common';
import { UsersController } from './users/api/users.controller';
import { AuthController } from './auth/api/auth.controller';
import { UsersQueryRepository } from './users/infrastructure/users-query.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserHandler } from './users/application/use.cases/createUser.command';
import { RegistrationUserHandler } from './auth/application/use.cases/registrationUser.command';
import { UsersRepository } from './users/infrastructure/users.repository';
import { CreateEmailConfirmationHandler } from './users/application/use.cases/createEmailConfirmation.command';
import { AuthService } from './auth/application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { SessionsRepository } from './devices/infrastructure/sessions.repository';
import { EmailConfirmationRepository } from './users/infrastructure/emailConfirmation.repository';
import { JWTService } from '../common/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { LocalStrategy } from '../guards/local/local.strategy';
import { CreateDeviceSessionHandler } from './devices/application/use.cases/createDeviceSession.command';
import { MailModule } from '../mail/mail.module';
import { RegistrationEmailResendingHandler } from './auth/application/use.cases/registrationEmailResending.command';
import { EmailConfirmationExistConstraint } from '../decorators/emailConfirmationExist.decorator';
import { ConfirmationCodeIsValidConstraint } from '../decorators/confirmationCodeIsValid.decorator';
import { RegistrationConfirmationHandler } from './auth/application/use.cases/registrationConfirmation.command';
import { PasswordRecoveryHandler } from './auth/application/use.cases/passwordRecovery.command';
import { PasswordRecoveryRepository } from './auth/infrastructure/passwordRecovery.repository';
import { EmailIsNotExistConstraint } from '../decorators/emailIsNotExist.decorator';
import { NewPasswordHandler } from './auth/application/use.cases/newPassword.command';
import { FindSessionByUserIdAndDeviceIdHandler } from './devices/application/use.cases/findSessionByUserIdAndDeviceId.command';
import { DeleteSessionHandler } from './devices/application/use.cases/deleteSession.command';
import { JwtStrategy } from '../guards/jwt/jwt-cookie.strategy';
import { UpdateSessionHandler } from './devices/application/use.cases/updateSession.command';
import { JwtAccessStrategy } from '../guards/jwt/jwt-header.strategy';
import { SecurityDevicesController } from './devices/api/devices.controller';
import { SessionsQueryRepository } from './devices/infrastructure/sessions-query.repository';
import { DeleteSessionExceptThisHandler } from './devices/application/use.cases/deleteSessiomsDevicesExceptThisOne.command';
import { DeleteDeviceSessionHandler } from './devices/application/use.cases/deleteDeviceSession.command';
import { GoogleStrategy } from '../guards/oath/google.strategy';
import { UsersProvidersRepository } from './users/infrastructure/users-providers.repository';
import { GoogleAuthHandler } from './auth/application/use.cases/google-auth.command';
import { CreateUserProviderHandler } from './auth/application/use.cases/create-userProvider.command';
import { TestingController } from './testing/api/testing.controller';
import { UpdateUserHandler } from './users/application/use.cases/updateUser.command';
import { RecaptchaAuthGuard } from '../guards/oath/recaptcha.auth.guard';
import { HttpModule } from '@nestjs/axios';
import { AuthConfig } from '../settings/auth.config';
import { ProfileRepository } from './users/infrastructure/profile.repository';
import { EditProfileHandler } from './users/application/use.cases/updateProfile.command';
import { ProfileOwnerGuard } from './users/guards/profile.owner.guard';
import { UploadProfileAvatarHandler } from './users/application/use.cases/uploadProfileAvatar.command';
import { ProfileQueryRepository } from './users/infrastructure/profile-query.repository';
import { DeleteAvatarHandler } from './devices/application/use.cases/deleteAvatar.command';
import { GithubStrategy } from '../guards/oath/github.strategy';
import { CreateUserAndProviderHandler } from './users/application/use.cases/createUser-provider.command';

const commands = [
  CreateUserHandler,
  RegistrationUserHandler,
  CreateEmailConfirmationHandler,
  CreateDeviceSessionHandler,
  RegistrationEmailResendingHandler,
  RegistrationConfirmationHandler,
  PasswordRecoveryHandler,
  NewPasswordHandler,
  FindSessionByUserIdAndDeviceIdHandler,
  DeleteSessionHandler,
  UpdateSessionHandler,
  DeleteSessionExceptThisHandler,
  DeleteDeviceSessionHandler,
  GoogleAuthHandler,
  CreateUserProviderHandler,
  CreateUserAndProviderHandler,
  UpdateUserHandler,
  EditProfileHandler,
  UploadProfileAvatarHandler,
  DeleteAvatarHandler,
];
const service = [PrismaService, AuthService, JWTService, JwtService];
const repositories = [
  UsersRepository,
  UsersQueryRepository,
  SessionsRepository,
  EmailConfirmationRepository,
  PasswordRecoveryRepository,
  SessionsQueryRepository,
  UsersProvidersRepository,
  ProfileRepository,
  ProfileQueryRepository,
];

@Module({
  imports: [CqrsModule, PassportModule, MailModule, HttpModule],
  controllers: [
    UsersController,
    AuthController,
    SecurityDevicesController,
    TestingController,
  ],
  providers: [
    AuthConfig,
    EmailConfirmationExistConstraint,
    ConfirmationCodeIsValidConstraint,
    EmailIsNotExistConstraint,
    ...service,
    ...commands,
    ...repositories,
    LocalStrategy,
    JwtStrategy,
    JwtAccessStrategy,
    GoogleStrategy,
    GithubStrategy,
    RecaptchaAuthGuard,
    ProfileOwnerGuard,
  ],
  exports: [],
})
export class AuthModule {}
