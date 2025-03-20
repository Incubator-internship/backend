import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ErrorsMessagesSwaggerType } from '../src/auth/api/models/output/auth-output.model';
import { EditProfileTypes } from '../src/users/api/models/input/edit-profile.types';

export function EditProfileEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Edit profile',
    }),
    ApiQuery({
      name: 'id',
      required: true,
      example: 5,
      description: 'Profile Id',
      type: Number,
    }),
    ApiBody({
      description: 'Data for constructing a new User entity',
      type: () => EditProfileTypes,
    }),

    ApiResponse({
      status: 200,
      description: 'Success',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 404,
      description: 'user not found',
    }),
    ApiResponse({
      status: 400,
      description:
        'The user`s age cannot be more than 100 or less than 13 years old. User with this user name already exist. User with this user name already exist',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function UploadAvatarEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload Avatar',
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          photo: {
            format: 'binary',
            description: 'Download photo, max size 2mb, format .jpg, .png',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Created',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 400,
      description:
        'At least one photo is required / Profile doesnt exist / Only .jpg or .png files allowed!',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 413,
      description: 'Payload too Large',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function GetProfileById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get profile by id',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: ProfileType,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
