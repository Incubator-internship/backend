import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../infrastructure/users-query.repository';
import { ApiTags } from '@nestjs/swagger';
import { EditProfileModel } from './models/input/edit-profile.model';
import { EditProfileCommand } from '../application/use.cases/updateProfile.command';

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

  @Put('profile/:id')
  async editProfile(
    @Param('id', ParseIntPipe) profileId: number,
    @Body() editProfileDTO: EditProfileModel,
  ) {
    //todo delete everything below
    console.log('editProfileDTO ', editProfileDTO);
    console.log('profileId ', profileId);
    console.log('profileId typeof', typeof profileId);
    await this.commandBus.execute(new EditProfileCommand(editProfileDTO));
    return editProfileDTO;
  }
}
