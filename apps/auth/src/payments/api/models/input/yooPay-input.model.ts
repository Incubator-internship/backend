import { IPaymentMethodType } from '@a2seven/yoo-checkout';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';

class CardDetails {
  @IsNotEmpty()
  @IsString()
  @Length(16, 16, { message: 'Card number must be 16 digits' })
  @Matches(/^[0-9]+$/, { message: 'Card number must contain only digits' })
  @ApiProperty({ example: '5555555555554477' })
  number: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 4, { message: 'CSC must be 3-4 digits' })
  @Matches(/^[0-9]+$/, { message: 'CSC must contain only digits' })
  @ApiProperty({ example: '123' })
  csc: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4, { message: 'Expiry year must be 4 digits' })
  @Matches(/^20[2-9][0-9]$/, { message: 'Expiry year must be in format 20XX' })
  @ApiProperty({ example: '2027' })
  expiry_year: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2, { message: 'Expiry month must be 2 digits' })
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Expiry month must be 01-12' })
  @ApiProperty({ example: '12' })
  expiry_month: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Cardholder name must contain only letters',
  })
  @ApiProperty({ example: 'John Doe' })
  cardholder: string;
}

export class YooInputModel {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '2.00' })
  value: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'test buy' })
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(
    [
      'bank_card',
      'apple_pay',
      'google_pay',
      'yoo_money',
      'qiwi',
      'webmoney',
      'sberbank',
      'alfabank',
      'tinkoff_bank',
      'b2b_sberbank',
      'sbp',
      'mobile_balance',
      'cash',
      'installments',
    ],
    { message: 'Invalid payment method type' },
  )
  @ApiProperty({ example: 'bank_card' })
  type: IPaymentMethodType;

  @ValidateNested()
  @Type(() => CardDetails)
  @ApiProperty({ type: () => CardDetails })
  card: CardDetails;

  userID?: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['1day', '7days', 'month'], {
    message: 'Subscription term must be either "1day", "7days" or "month"',
  })
  @ApiProperty({ example: 'month', enum: ['1day', '7days', 'month'] })
  subscriptionTerm: '1day' | '7days' | 'month';
}
