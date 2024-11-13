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
}
export class AllUsersType {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
