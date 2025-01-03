import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiFailedDependencyResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import {
  LoginInputModelType,
  RegistrationInputUserModel,
} from '../src/auth/api/models/input/auth-input.model';
import {
  ErrorsMessagesSwaggerType,
  ReturnAccessJWTforSwagger,
} from '../src/auth/api/models/output/auth-output.model';
import { UserAuthMeDTO } from '../src/users/api/models/output/userOutput.types';
import { PostOutputModel } from '../src/posts/api/models/output/posts.output.model';
import { PostUpdateInputModel } from '../src/posts/api/models/input/posts-input.model';

export function RegistrationUserEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Registration in the system. Email with confirmation code will be snd to passed email address',
    }),
    ApiBody({
      description: 'Data for constructing a new User entity',
      type: () => RegistrationInputUserModel,
    }),
    // ApiResponse({
    //   status: 409,
    //   description:
    //     'This user already exist (user name or email have to unique)',
    // }),
    // ApiResponse({
    //   status: 400,
    //   description:
    //     'temporary solution, if email already exist: "Registration user command found user by the same email", if userName already exist: "Registration user command found user by the same userName"',
    // }),
    ApiResponse({
      status: 400,
      description:
        'If the inputModel has incorrect values (in particular if the user with the given email or login already exists). ' +
        'And temporary solution, if email already exist: "Registration user command found user by the same email",' +
        ' if userName already exist: "Registration user command found user by the same userName"',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
    ApiResponse({
      status: 204,
      description:
        'Input data is accepted. Email with confirmation code will be send to passed email address',
    }),
  );
}

export function LoginUserEndpoint() {
  return applyDecorators(
    ApiOperation({ summary: 'Try login user to the system' }),
    ApiBody({
      description: 'Credentials for enter to the system',
      type: () => LoginInputModelType,
    }),
    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken (expired after 5 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 24 hours).',
      type: () => ReturnAccessJWTforSwagger,
    }),
    ApiResponse({
      status: 400,
      description: 'If the inputModel has incorrect values',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 401,
      description: 'If the password or login is wrong',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function RegEmailResendingEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend confirmation registration Email if user exists',
    }),
    ApiResponse({
      status: 204,
      description:
        'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param,' +
        ' for example: https://some-front.com/confirm-registration?code=youtcodehere',
    }),
    ApiResponse({
      status: 400,
      description: 'If the inputModel has incorrect values',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function RegConfirmationEndpoint() {
  return applyDecorators(
    ApiOperation({ summary: 'Confirm registration' }),
    ApiResponse({
      status: 204,
      description: 'Email was verified. Account was activated',
    }),
    ApiResponse({
      status: 400,
      description:
        'If the confirmation code is incorrect, expired or already been applied',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function PasswordRecoveryEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Password recovery via Email confirmation.Email should be sent with Recovery Code inside',
    }),
    ApiResponse({
      status: 204,
      description:
        "Even if current email is not registered (for prevent user's email detection)",
    }),
    ApiResponse({
      status: 400,
      description:
        'If the inputModel has invalid email (for example 222^gmail.com)',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function NewPasswordEndpoint() {
  return applyDecorators(
    ApiOperation({ summary: 'Confirm Password recovery' }),
    ApiResponse({
      status: 204,
      description: 'If code is valid and new password is accepted',
    }),
    ApiResponse({
      status: 400,
      description:
        'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
      type: () => ErrorsMessagesSwaggerType,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function LogoutEndpoint() {
  return applyDecorators(
    ApiCookieAuth('refreshToken'),
    ApiOperation({
      summary:
        'In cookie client must send correct refreshToken that will be revoked',
    }),
    ApiResponse({
      status: 204,
      description: 'No Content',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function RefreshTokenEndpoint() {
  return applyDecorators(
    //ApiSecurity('refreshToken'),
    ApiCookieAuth('refreshToken'),
    ApiOperation({
      summary:
        'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken' +
        'tht will be revoked after refreshing) Device LastActiveDate should be overrode by issued Date of new refresh token',
    }),
    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken (expired after 5 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 24 hours).',
      type: () => ReturnAccessJWTforSwagger,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
//******************************************************************************
export function GetAllPostsEndpoint() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all posts',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: () => PostOutputModel,
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
      type: String,
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
      type: String,
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
class ReturnPostIdSwagger {
  @ApiProperty({ example: 3 })
  postId: number;
}
