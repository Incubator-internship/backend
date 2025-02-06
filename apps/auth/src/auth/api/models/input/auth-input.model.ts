import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { EmailConfirmationExist } from '../../../../../decorators/emailConfirmationExist.decorator';
import { ConfirmationCodeIsValid } from '../../../../../decorators/confirmationCodeIsValid.decorator';
import { EmailIsNotExist } from '../../../../../decorators/emailIsNotExist.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationInputUserModel {
  @ApiProperty({
    required: true,
    description: 'User name',
    minLength: 6,
    maxLength: 15,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 30)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  userName: string;
  @ApiProperty({
    required: true,
    description: 'Password',
    minLength: 6,
    maxLength: 20,
    example: 'string',
    pattern:
      '^(?=.*[0-9])(?=.*[A-Z])(?=.*[! "#$%&\'()*+,-./:;<=>?@[\\\\\\]^_`{|}~]).*$',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[! "#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]).*$/,
  )
  password: string;
  @ApiProperty({
    required: true,
    description: 'Email',
    example: 'example@example.com',
    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
export class LoginInputModelType {
  @ApiProperty({ required: true, example: 'string' })
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;
  @ApiProperty({ required: true, example: 'string' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
export class InputEmailModel {
  @ApiProperty({
    required: true,
    description: 'Email',
    example: 'example@example.com',
    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
  })
  @IsString()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @EmailConfirmationExist()
  email: string;
}
export class InputCodeModel {
  @ApiProperty({
    required: true,
    description: 'Code that be sent via Email inside link',
    example: 'string',
  })
  @IsString()
  @ConfirmationCodeIsValid()
  code: string;
}
export class InputPasswordRecoveryModel {
  @ApiProperty({
    required: true,
    description: 'Email',
    example: 'example@example.com',
    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
  })
  @IsString()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @EmailIsNotExist({ message: 'Email doesnt exist' })
  email: string;
}
export class InputNewPasswordModel {
  @ApiProperty({
    required: true,
    description: 'New Password',
    minLength: 6,
    maxLength: 20,
    example: 'string',
    pattern:
      '^(?=.*[0-9])(?=.*[A-Z])(?=.*[! "#$%&\'()*+,-./:;<=>?@[\\\\\\]^_`{|}~]).*$',
  })
  @IsString()
  @Length(6, 20)
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[! "#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]).*$/,
  )
  newPassword: string;
  @ApiProperty({
    required: true,
    description: 'recovery code by email',
  })
  @IsString()
  recoveryCode: string;
}
