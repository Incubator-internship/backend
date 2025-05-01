import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { LoginInputModelType } from '../api/models/input/auth-input.model';
import {
  ExceptionResultType,
  ResultCode,
} from '../../../common/exception-filters/exception.handler';
import { UserModel } from '../../users/domain/createUser.model';
import { AuthConfig } from 'apps/auth/settings/auth.config';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private authConfig: AuthConfig,
  ) {}

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
  async getOauthGitHub() {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      const scope = 'user:email read:user';

      const params = {
        client_id: this.authConfig.githubClientId,
        redirect_uri: this.authConfig.githubCallbackUrl,
        scope: scope,
        state: state,
      };

      // Формируем URL для перенаправления
      const authUrl = `https://github.com/login/oauth/authorize?${new URLSearchParams(params)}`;

      return {
        success: true,
        message: 'Redirecting to GitHub',
        data: { authUrl, state },
      };
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return {
        success: false,
        message: 'Failed to initiate GitHub OAuth',
        data: null,
      };
    }
  }
}
