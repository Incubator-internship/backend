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
];
const service = [PrismaService, AuthService, JWTService, JwtService];
const repositories = [
  UsersRepository,
  UsersQueryRepository,
  SessionsRepository,
  EmailConfirmationRepository,
  PasswordRecoveryRepository,
  SessionsQueryRepository,
];

@Module({
  imports: [CqrsModule, AuthModule, PassportModule, MailModule],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
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
  ],
  exports: [],
})
export class AuthModule {}
