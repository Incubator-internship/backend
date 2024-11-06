import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { SessionsRepository } from '../../src/devices/infrastructure/sessions.repository';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-cookie') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  constructor(private readonly sessionsRepository: SessionsRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refreshToken'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: '12345',
      /*appSettings.api.JWT_SECRET*/ /*|| process.env.JWT_SECRET || '123'*/
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
    console.log('JwtRefreshAuthGuard');
    console.log(' userId deviceId iat ', userId, deviceId, iat);
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
