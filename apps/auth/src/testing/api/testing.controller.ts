import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';

@ApiTags('Testing')
@Controller('testing')
export class TestingController {
  constructor(protected prismaService: PrismaService) {}

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
}
