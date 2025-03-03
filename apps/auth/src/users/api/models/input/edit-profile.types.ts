import {
  IsISO8601,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../../../../../../common/decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class EditProfileTypes {
  @ApiProperty({
    example: 'user',
    required: true,
    description: 'User name',
    minLength: 6,
    maxLength: 30,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @IsString()
  @Trim()
  @Length(6, 30)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  userName: string;
  @ApiProperty({
    example: 'Hank',
    required: true,
    description: 'FirstName',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @IsString()
  @Trim()
  @Length(1, 50)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  firstName: string;
  @ApiProperty({
    example: 'Moody',
    required: true,
    description: 'LastName',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @IsString()
  @Trim()
  @Length(1, 50)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  lastName: string;
  @ApiProperty({
    example: '25.01.1978',
    required: true,
    description: 'Date of birthday. A user under 13 cannot create a profile',
    pattern: '^(\\d{2}\\.\\d{2}\\.\\d{4})?$',
  })
  @IsString()
  @Trim()
  //@IsISO8601()
  @Matches(/^(\d{2}\.\d{2}\.\d{4})?$/)
  dateOfBirthday: string | null = null;
  @ApiProperty({
    example: 'United Kingdom',
    required: false,
    description: 'Country',
    minLength: 1,
    maxLength: 30,
  })
  @IsString()
  @Trim()
  @MaxLength(30)
  country: string | null = null;
  @ApiProperty({
    example: 'Edinburgh',
    required: false,
    description: 'City',
    minLength: 1,
    maxLength: 30,
  })
  @IsString()
  @Trim()
  @MaxLength(30)
  city: string | null = null;
  @ApiProperty({
    example:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' +
      " Lorem Ipsum has been the industry's standard dummy text ever since the 1500s," +
      ' when an unknown printer took a galley of type and scrambled it to make a type specimen book.' +
      ' It has survived not only five centuries, but also the leap into electronic typesetting,' +
      ' remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset' +
      ' sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like ' +
      'Aldus PageMaker including versions of Lorem Ipsum.',
    required: false,
    description: 'About Me',
    maxLength: 200,
  })
  @IsString()
  @Trim()
  @MaxLength(200)
  aboutMe: string | null = null;
}
