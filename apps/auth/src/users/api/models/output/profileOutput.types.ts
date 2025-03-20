import { ApiProperty } from '@nestjs/swagger';

export class ProfileOutputDTO {
  @ApiProperty({ example: 1 })
  profileId: number;
  @ApiProperty({ example: 'Gabe' })
  firstName: string;
  @ApiProperty({ example: 'Newell' })
  lastName: string;
  @ApiProperty({ example: 1 })
  dateOfBirthday: string | null;
  @ApiProperty({ example: 1 })
  country: string | null;
  @ApiProperty({ example: 1 })
  city: string | null;
  @ApiProperty({ example: 1 })
  aboutMe: string | null;
  @ApiProperty({ example: 1 })
  originalAvatarUrl: string | null;
  @ApiProperty({ example: 1 })
  smallAvatarUrl: string | null;
  @ApiProperty({ example: 1 })
  createdAt: Date;
  @ApiProperty({ example: 1 })
  updatedAt: Date;
}
