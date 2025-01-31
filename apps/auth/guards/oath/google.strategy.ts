import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { AuthConfig } from '../../settings/auth.config';

dotenv.config();

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private configService: ConfigService) {
    super({
      accessType: 'offline',
    });
  }
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authConfig: AuthConfig) {
    //todo delete console.log in google.strategy
    console.log('GoogleStrategy clientID', authConfig.googleClientId);
    console.log('GoogleStrategy clientSecret', authConfig.googleClientSecret);
    console.log('GoogleStrategy callbackURL', authConfig.googleCallBackProdUrl);
    super({
      clientID: authConfig.googleClientId,
      clientSecret: authConfig.googleClientSecret,
      callbackURL: authConfig.googleCallBackProdUrl,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log('profile', profile);
    const { name, emails, photos, provider } = profile;
    const { sub } = profile._json;
    const user = {
      email: emails[0].value,
      //firstName: name.givenName,
      //lastName: name.familyName,
      //picture: photos[0].value,
      providerId: sub,
      providerType: provider,
      //accessToken,
      //refreshToken,
    };
    console.log('user', user);
    done(null, user);
  }
}
