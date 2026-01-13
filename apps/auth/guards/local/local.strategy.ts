import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { UserModel } from 'apps/auth/src/users/domain/createUser.model';
import { Strategy } from 'passport-local';
import { AuthService } from '../../src/auth/application/auth.service';
import { plainToClass } from 'class-transformer';
import { LoginInputModelType } from '../../src/auth/api/models/input/auth-input.model';
import { validate } from 'class-validator';

@Injectable()
export class LoginGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserModel> {
    // Convert input data to an instance of LoginInputModelType
    const loginDTO = plainToClass(LoginInputModelType, {
      loginOrEmail,
      password,
    });
    // Validate the data
    const errors = await validate(loginDTO);
    if (errors.length > 0) {
      throw new UnauthorizedException('loginOrEmail or password failed');
    }
    const result = await this.authService.checkCredentials({
      loginOrEmail,
      password,
    });
    if (!result.data) {
      throw new UnauthorizedException();
    }
    return result.data;
  }
}
