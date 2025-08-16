import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { YooInputModel } from '../src/payments/api/models/input/yooPay-input.model';
import { PayPalInputModel } from '../src/payments/api/models/input/payPal-input.model';

export function buyYooEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Initiate payment via YooKassa' }),
    ApiBody({
      description: 'Payment input model',
      type: YooInputModel,
      required: true,
    }),
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
export function buyPayPalEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Initiate payment via YooKassa' }),
    ApiBody({
      description: 'Payment input model',
      type: PayPalInputModel,
      required: true,
    }),
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

export function cancelPayPalEndpoint() {
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
            payIdPayPal: { type: 'string' },
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

export function getMyPaymentsPayPalEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Retrieve all your payments via PayPal' }),
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
            payIdPayPal: { type: 'string' },
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

export function getActiveSubscription() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current active subscription for user' }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved active subscription',
      schema: {
        type: 'object',
        properties: {
          succeeded: { type: 'boolean', example: true },
          message: { type: 'string', example: '' },
          data: {
            type: 'object',
            properties: {
              userId: {
                type: 'number',
                example: 12345,
                description: 'ID of the subscription owner',
              },
              subscriptionStart: {
                type: 'string',
                format: 'date-time',
                example: '2023-10-15T14:30:00Z',
                nullable: true,
                description: 'Subscription activation date',
              },
              subscriptionEnd: {
                type: 'string',
                format: 'date-time',
                example: '2024-10-15T14:30:00Z',
                nullable: true,
                description: 'Subscription expiration date',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - invalid or missing access token',
    }),
    ApiResponse({
      status: 404,
      description: 'No active subscription found for user',
      schema: {
        type: 'object',
        properties: {
          succeeded: { type: 'boolean', example: false },
          message: { type: 'string', example: 'No active subscription' },
          data: { type: 'object' },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          succeeded: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Failed to check subscription' },
          data: { type: 'object' },
        },
      },
    }),
  );
}

export function autoRenewEnable() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Enable automatic subscription renewal',
      description:
        'Activates auto-renewal feature for the current user subscription',
    }),
    ApiResponse({
      status: 200,
      description: 'Auto-renewal successfully enabled',
      schema: {
        type: 'object',
        properties: {
          succeeded: {
            type: 'boolean',
            example: true,
            description: 'Indicates if operation was successful',
          },
          message: {
            type: 'string',
            example: '',
            description: 'Optional status message',
          },
          data: {
            type: 'object',
            description: 'Empty object as no additional data returned',
            example: {},
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad request - subscription already has auto-renewal enabled',
      schema: {
        type: 'object',
        properties: {
          succeeded: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Auto-renewal already enabled' },
          data: { type: 'object' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - invalid or missing access token',
      schema: {
        type: 'object',
        properties: {
          succeeded: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Unauthorized' },
          data: { type: 'object' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - no active subscription exists',
      schema: {
        type: 'object',
        properties: {
          succeeded: { type: 'boolean', example: false },
          message: { type: 'string', example: 'No active subscription found' },
          data: { type: 'object' },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error - failed to enable auto-renewal',
      schema: {
        type: 'object',
        properties: {
          succeeded: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Failed to enable auto-renewal' },
          data: { type: 'object' },
        },
      },
    }),
  );
}
