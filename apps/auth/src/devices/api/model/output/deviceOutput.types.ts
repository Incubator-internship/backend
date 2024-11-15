import { ApiProperty } from '@nestjs/swagger';

export class deviceSessionDTO {
  @ApiProperty({
    required: true,
    description: 'IP address of device during signing in',
    example: 'string',
  })
  ip: string;
  @ApiProperty({
    required: true,
    description:
      'for example Chrome 105 (received by parsing http header "user-agent")',
    example: 'string',
  })
  title: string;
  @ApiProperty({
    required: true,
    description: 'Date of the last generating of refresh/access tokens',
    example: 'string',
  })
  lastActiveDate: string;
  @ApiProperty({
    required: true,
    description: 'Id of connected device session',
    example: 'string',
  })
  deviceId: string;
}
