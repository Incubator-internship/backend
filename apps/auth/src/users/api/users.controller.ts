import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../infrastructure/users-query.repository';
import { ApiTags } from '@nestjs/swagger';
import { EditProfileModel } from './models/input/edit-profile.model';
import { EditProfileCommand } from '../application/use.cases/updateProfile.command';
import { JwtAccessAuthGuard } from '../../../guards/jwt/jwt-header.strategy';
import { ProfileOwnerGuard } from '../guards/profile.owner.guard';

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

  @UseGuards(JwtAccessAuthGuard, ProfileOwnerGuard)
  @Put('profile/:id')
  async editProfile(
    @Param('id', ParseIntPipe) profileId: number,
    @Body() editProfileDTO: EditProfileModel,
  ) {
    await this.commandBus.execute(
      new EditProfileCommand({ ...editProfileDTO, profileId }),
    );
    return editProfileDTO;
  }
}
