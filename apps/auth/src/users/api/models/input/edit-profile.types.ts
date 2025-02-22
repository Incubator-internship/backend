import {
  IsISO8601,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../../../../../../common/decorators/trim.decorator';

export class EditProfileTypes {
  @IsString()
  @Trim()
  @Length(6, 30)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  userName: string;
  @IsString()
  @Trim()
  @Length(1, 50)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  firstName: string;
  @IsString()
  @Trim()
  @Length(1, 50)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  lastName: string;
  @IsString()
  @Trim()
  //@IsISO8601()
  @Matches(/^(\d{2}\.\d{2}\.\d{4})?$/)
  dateOfBirthday: string | null = null;
  @IsString()
  @Trim()
  @MaxLength(30)
  country: string | null = null;
  @IsString()
  @Trim()
  @MaxLength(30)
  city: string | null = null;
  @IsString()
  @Trim()
  @MaxLength(200)
  aboutMe: string | null = null;
}
