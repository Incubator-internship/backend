import { Module } from '@nestjs/common';
import { UsersController } from '../users/api/users.controller';
import { AuthController } from './api/auth.controller';
import { UsersQueryRepository } from '../users/infrastructure/users-query.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserHandler } from '../users/application/use.cases/createUser.command';
import { RegistrationUserHandler } from './application/use.cases/registrationUser.command';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { CreateEmailConfirmationHandler } from '../users/application/use.cases/createEmailConfirmation.command';

const commands = [
  CreateUserHandler,
  RegistrationUserHandler,
  CreateEmailConfirmationHandler,
];
const service = [];
const repositories = [UsersRepository, UsersQueryRepository];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [UsersController, AuthController],
  providers: [PrismaService, ...commands, ...repositories],
  exports: [PrismaService],
})
export class AuthModule {}
