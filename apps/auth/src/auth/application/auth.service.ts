import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { LoginInputModelType } from '../api/models/input/auth-input.model';
import {
  ExceptionResultType,
  ResultCode,
} from '../../../common/exception-filters/exception.handler';
import { UserModel } from '../../users/domain/createUser.model';

@Injectable()
export class AuthService {
  constructor(private usersRepository: UsersRepository) {}

  async checkCredentials(
    loginDTO: LoginInputModelType,
  ): Promise<ExceptionResultType<UserModel | null>> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginDTO.loginOrEmail,
      loginDTO.loginOrEmail,
    );
    if (!user) {
      return {
        code: ResultCode.NotFound,
        message: 'User not found',
        data: null,
      };
    }
    // const passwordHash = await this._generateHash(
    //   loginDTO.password,
    //   user.passwordSalt,
    // );
    const isPasswordValid = bcrypt.compareSync(
      loginDTO.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return {
        code: ResultCode.Unauthorized,
        message: 'login/email/password has been incorrect',
        data: null,
      };
    }
    return {
      code: ResultCode.Success,
      message: 'User has been found',
      data: user,
    };
  }
  // async _generateHash(password: string, salt: string) {
  //   return bcrypt.hashSync(password, salt);
  // }
}
