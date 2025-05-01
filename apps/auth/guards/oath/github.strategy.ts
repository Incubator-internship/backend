import { Injectable } from '@nestjs/common';
import { Strategy, StrategyOptions } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '../../settings/auth.config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import axios from 'axios';

@Injectable()
export class GitHubOAuthGuard extends AuthGuard('google') {
  constructor(private configService: ConfigService) {
    super({
      accessType: 'offline',
    });
  }
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(protected authConfig: AuthConfig) {
    const settingsGitHub = {
      clientID: authConfig.githubClientId,
      clientSecret: authConfig.githubClientSecret,
      callbackURL: authConfig.githubCallbackUrl,
      scope: ['user:email', 'read:user'],
      passReqToCallback: true,
    } as unknown as StrategyOptions;
    super(settingsGitHub);
  }

  async validate(
    accessToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) {
    try {
      if (!profile || !profile.id || !profile.username) {
        throw new Error('Invalid GitHub profile: missing required fields');
      }

      let email = profile.emails?.[0]?.value;

      if (!email) {
        const { data } = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `token ${accessToken}` },
        });
        email = data.find((e: any) => e.primary)?.email || data[0]?.email;
      }

      if (!email) {
        email = `${profile.username}@users.noreply.github.com`;
      }

      const user = {
        providerId: profile.id,
        username: profile.username,
        providerType: profile.provider,
        displayName: profile.displayName || profile.username,
        email,
        accessToken,
      };

      done(null, user);
    } catch (error) {
      console.error('GitHub Auth Error:', error);
      done(error, null);
    }
  }
}
