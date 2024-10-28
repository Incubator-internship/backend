import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { RegistrationUserModel } from './models/input/auth-input.model';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationUserCommand } from '../application/use.cases/registrationUser.command';

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @HttpCode(204)
  @Post('registration')
  async registration(@Body() registrationDTO: RegistrationUserModel) {
    await this.commandBus.execute(new RegistrationUserCommand(registrationDTO));
  }

  @HttpCode(200)
  @Post('Login')
  async singIn() {}
}
