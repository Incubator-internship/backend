import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { deviceSessionDTO } from '../src/devices/api/model/output/deviceOutput.types';
import { applyDecorators } from '@nestjs/common';

export function GetDevices() {
  return applyDecorators(
    ApiCookieAuth('refreshToken'),
    ApiOperation({
      summary: 'Returns all devices with active sessions for current user',
    }),
    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken (expired after 5 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 24 hours).',
      type: [deviceSessionDTO],
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
export function DeleteAllDeviceSessions() {
  return applyDecorators(
    ApiCookieAuth('refreshToken'),
    ApiOperation({
      summary: 'Terminate all other (exclude current) device`s sessions',
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
export function DeleteDeviceSessionsByDeviceId() {
  return applyDecorators(
    ApiCookieAuth('refreshToken'),
    ApiParam({
      name: 'deviceId',
      required: true,
      description: 'DeviceId of session that will be terminated',
    }),
    ApiOperation({
      summary: 'Terminate specified device sessions by deviceId',
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
      status: 403,
      description: 'If try to delete the deviceId of other user',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
