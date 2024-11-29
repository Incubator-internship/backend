import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../../src/auth/application/auth.service';
import { Strategy } from 'passport-github2';
import * as process from 'node:process';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

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
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    try {
      // Ваш код для обработки профиля
      const emails = profile.emails || [];
      const email = emails.length > 0 ? emails[0].value : null;

      // Проверка наличия email
      if (!email) {
        throw new Error('No email associated with this account.');
      }

      // Возвращаем информацию о пользователе
      return {
        email,
        providerId: profile.id,
        providerType: 'github',
      };
    } catch (error) {
      throw new Error(error.message); // Или обработайте ошибку по-другому
    }
  }
}
