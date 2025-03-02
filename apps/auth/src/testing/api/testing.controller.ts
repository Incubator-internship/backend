import { Controller, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsersQueryRepository } from '../../users/infrastructure/users-query.repository';

@ApiTags('Endpoints for development')
@Controller('testing')
export class TestingController {
  constructor(
    protected prismaService: PrismaService,
    private userQueryRepository: UsersQueryRepository,
  ) {}

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    // Delete all related data
    await this.prismaService.emailConfirmation.deleteMany({
      where: { userId: id },
    });
    await this.prismaService.session.deleteMany({ where: { userId: id } });
    await this.prismaService.passwordRecovery.deleteMany({
      where: { userId: id },
    });
    await this.prismaService.provider.deleteMany({ where: { userId: id } });
    // Delete the user
    await this.prismaService.user.delete({ where: { id } });
  }

  @Get()
  async getAllUsers() {
    return await this.userQueryRepository.getAllUsers();
  }
}
