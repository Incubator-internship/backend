import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { User } from 'apps/auth/src/users/domain/createUser.model';
import { Strategy } from 'passport-local';
import { AuthService } from '../../src/auth/application/auth.service';

@Injectable()
export class LoginGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<User> {
    const result = await this.authService.checkCredentials({
      loginOrEmail,
      password,
    });
    console.log('result ', result);
    console.log('result ', result.data);
    if (!result.data) {
      throw new UnauthorizedException();
    }
    return result.data;
  }
}
