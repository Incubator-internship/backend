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
import { IsNotEmailExistConstraint } from '../guards/emailIsnotExist.guard';

const commands = [
  CreateUserHandler,
  RegistrationUserHandler,
  CreateEmailConfirmationHandler,
  CreateDeviceSessionHandler,
  RegistrationEmailResendingHandler,
];
const service = [];
const repositories = [
  UsersRepository,
  UsersQueryRepository,
  SessionsRepository,
  EmailConfirmationRepository,
];

@Module({
  imports: [CqrsModule, AuthModule, PassportModule, MailModule],
  controllers: [UsersController, AuthController],
  providers: [
    IsNotEmailExistConstraint,
    PrismaService,
    AuthService,
    JWTService,
    JwtService,
    ...commands,
    ...repositories,
    LocalStrategy,
  ],
  exports: [PrismaService],
})
export class AuthModule {}
