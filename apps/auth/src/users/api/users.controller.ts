import { Controller, Get } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../infrastructure/users-query.repository';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Endpoints for development')
@Controller('users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private userQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  async getAllUsers() {
    return await this.userQueryRepository.getAllUsers();
  }
}
