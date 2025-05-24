import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
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

export function AuthMeEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: () => UserAuthMeDTO,
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

export function buyYooEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Initiate payment via YooKassa' }),
    ApiResponse({
      status: 201,
      description: 'Payment successfully created, returns redirect URL',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 500,
      description: 'Internal server error during payment',
    }),
  );
}

export function cancelYooEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cancel auto-payment subscription' }),
    ApiResponse({
      status: 204,
      description: 'Auto-payment successfully canceled',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 500, description: 'Failed to cancel auto-payment' }),
  );
}

export function getMyPaymentsEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Retrieve all your payments via YooKassa' }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved payments list',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            userId: { type: 'number' },
            payid: { type: 'number' },
            payIdYoo: { type: 'string' },
            status: { type: 'string' },
            amount: { type: 'string' },
            IPaymentMethodData: { type: 'string' },
            subscriptionStart: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            subscriptionTerm: { type: 'string', nullable: true },
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 500, description: 'Failed to fetch payments' }),
  );
}
export function GitHubUrl() {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate GitHub OAuth flow',
      description:
        'Redirects user to GitHub for authentication. After successful login, GitHub will redirect back to the callback URL.',
    }),
    ApiResponse({
      status: 302,
      description:
        'Redirects user to GitHub OAuth page for authentication. After successful login on GitHub, user will be redirected to `${base_url}auth/github/login-success` with access token in response and refresh token set in HttpOnly cookie. If authentication fails, user will be redirected to `${base_url}auth/login`.',
      headers: {
        Location: {
          description: 'GitHub OAuth URL',
          schema: {
            type: 'string',
            example: 'https://github.com/login/oauth/authorize?client_id=...',
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          statusCode: 500,
          message: 'Authorization URL not found',
        },
      },
    }),
  );
}
