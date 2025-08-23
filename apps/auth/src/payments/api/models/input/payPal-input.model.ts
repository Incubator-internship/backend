import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class PayPalInputModel {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '2.00' })
  value: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'test buy' })
  description: string;

  userID?: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['1day', '7days', 'month'], {
    message: 'Subscription term must be either "1day", "7days" or "month"',
  })
  @ApiProperty({ example: 'month', enum: ['1day', '7days', 'month'] })
  subscriptionTerm: '1day' | '7days' | 'month';

  timezone?: string;
}

export class ToggleAutoPayModel {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ example: true })
  enable: string;
}
