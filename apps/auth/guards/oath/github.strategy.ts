import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../../src/auth/application/auth.service';
import { Strategy } from 'passport-github2';
import * as process from 'node:process';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { VerifyCallback } from 'passport-google-oauth20';

dotenv.config();
@Injectable()
export class GitHubOAuthGuard extends AuthGuard('github') {
  constructor(private configService: ConfigService) {
    super();
  }
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_LOCAL_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      // Возвращаем информацию о пользователе
      const user = {
        email: profile._json.email.toString(),
        providerId: profile._json.id.toString(),
        providerType: profile.provider.toString(),
      };
      done(null, user);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
