import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import { ErrorsMessagesSwaggerType } from '../src/auth/api/models/output/auth-output.model';
import { PostOutputModel } from '../src/posts/api/models/output/posts.output.model';
import { PostUpdateInputModel } from '../src/posts/api/models/input/posts-input.model';

export function GetAllPostsEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all posts',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: [PostOutputModel],
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function CreatePostEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create new post',
    }),
    ApiBearerAuth(),
    ApiBody({
      description: 'Create Post',
      required: true,
      schema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            maxLength: 500,
            description: 'Some content which describe photos, NO Mandatory!',
          },
          photos: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
              description: 'Download photo min 1 max 10',
            },
            minItems: 1,
            maxItems: 10,
          },
        },
        required: ['photos'],
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Return postId',
      type: () => ReturnPostIdSwagger,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 400,
      description: 'If the inputModel has incorrect values',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 413,
      description: 'Payload to Large',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function UpdatePostEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update post',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'postId',
      required: true,
      type: Number,
    }),
    ApiBody({
      description: 'Data for updating post',
      type: () => PostUpdateInputModel,
    }),
    ApiResponse({
      status: 204,
      description: 'Post has been updated',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 400,
      description: 'If the inputModel has incorrect values',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
export function DeletePostEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete post',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'postId',
      required: true,
      type: Number,
    }),
    ApiResponse({
      status: 204,
      description: 'Post has been deleted',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function GetPostByPostIdEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get post by postId',
    }),
    ApiParam({
      name: 'id',
      description: 'postId',
      required: true,
      type: Number,
    }),
    ApiResponse({
      status: 200,
      description: 'Post has been deleted',
      type: () => PostOutputModel,
    }),
    ApiResponse({
      status: 404,
      description: 'Forbidden',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 400,
      description: 'Forbidden',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function GetPostsByUserIdEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get posts by userId',
    }),
    ApiParam({
      name: 'userId',
      description: 'userId',
      required: true,
      type: Number,
    }),
    ApiResponse({
      status: 200,
      description: 'Post has been deleted',
      type: [PostOutputModel],
    }),
    ApiResponse({
      status: 400,
      description: 'Forbidden',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

class ReturnPostIdSwagger {
  @ApiProperty({ example: 3 })
  postId: number;
}
