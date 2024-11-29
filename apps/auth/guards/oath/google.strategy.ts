import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as process from 'node:process';

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
  constructor() {
    super({
      // clientID: appSettings.api.GOOGLE_CLIENT_ID,
      // clientSecret: appSettings.api.GOOGLE_CLIENT_SECRET,
      // callbackURL: appSettings.api.GOOGLE_CALLBACK_LOCAL_URL,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_PROD_URL,
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
