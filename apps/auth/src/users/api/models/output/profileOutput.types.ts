import { ApiProperty } from '@nestjs/swagger';

export class ProfileOutputDTO {
  @ApiProperty({ example: 1 })
  profileId: number;
  @ApiProperty({ example: 'Gabe' })
  firstName: string;
  @ApiProperty({ example: 'Newell' })
  lastName: string;
  @ApiProperty({ example: '03.11.1962' })
  dateOfBirthday: string | null;
  @ApiProperty({ example: 'USA' })
  country: string | null;
  @ApiProperty({ example: 'Seattle' })
  city: string | null;
  @ApiProperty({
    example:
      'Gabe Newell is the president and co-founder of the video game company Valve Corporation.',
  })
  aboutMe: string | null;
  @ApiProperty({ example: 'https://docs.nestjs.com/' })
  originalAvatarUrl: string | null;
  @ApiProperty({ example: 'https://docs.nestjs.com/' })
  smallAvatarUrl: string | null;
  @ApiProperty({ example: '2025-02-20T23:36:35.783Z' })
  createdAt: string;
  @ApiProperty({ example: '2025-02-20T23:36:35.783Z' })
  updatedAt: string;
}
