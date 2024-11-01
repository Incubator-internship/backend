import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { EmailConfirmationExist } from '../../../../../decorators/emailConfirmationExist.decorator';
import { ConfirmationCodeIsValid } from '../../../../../decorators/confirmationCodeIsValid.decorator';
import { EmailIsNotExist } from '../../../../../decorators/emailIsNotExist.decorator';

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
export class InputEmailModel {
  @IsString()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @EmailConfirmationExist()
  email: string;
}
export class InputCodeModel {
  @IsString()
  @ConfirmationCodeIsValid()
  code: string;
}
export class InputPasswordRecoveryModel {
  @IsString()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @EmailIsNotExist()
  email: string;
}
