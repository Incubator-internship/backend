import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { SessionsRepository } from '../../src/devices/infrastructure/sessions.repository';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AuthConfig } from '../../settings/auth.config';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-cookie') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private authConfig: AuthConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refreshToken'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret,
    });
  }

  async validate({
    userId,
    deviceId,
    iat,
  }: {
    userId: number;
    deviceId: string;
    iat: string;
  }) {
    const issuedAt = new Date(+iat * 1000).toISOString();
    const session = await this.sessionsRepository.findSessionForCheckCookie(
      userId,
      deviceId,
      issuedAt,
    );
    if (!session) {
      throw new UnauthorizedException();
    }
    return { userId, deviceId };
  }
}
