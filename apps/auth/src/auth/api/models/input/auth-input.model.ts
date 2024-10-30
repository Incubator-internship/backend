import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegistrationUserModel {
  @IsString()
  @Length(6, 30)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  userName: string;
  @IsString()
  @Length(6, 20)
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[! "#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]).*$/,
  )
  password: string;
  @IsString()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
export class LoginInputModelType {
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
