import { ApiProperty } from '@nestjs/swagger';

export class UserAuthMeDTO {
  @ApiProperty({
    example: 'number',
  })
  userId: number;
  @ApiProperty({
    example: 'string',
  })
  login: string;
  @ApiProperty({
    example: 'string',
  })
  email: string;

  @ApiProperty({
    example: 'string',
  })
  accountType?: string;

  @ApiProperty({
    example: 'string',
    required: false,
  })
  subscriptionTerm?: string | null;

  @ApiProperty({
    example: 'string',
    required: false,
  })
  amount?: string | null;
}
export class AllUsersType {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
