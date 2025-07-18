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