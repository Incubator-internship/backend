import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { SessionsRepository } from '../../src/devices/infrastructure/sessions.repository';
import { ExtractJwt } from 'passport-jwt';

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
      secretOrKey: process.env.JWT_SECRET || '123',
    });
  }

  async validate({
    userId,
    deviceId,
    iat,
  }: {
    userId: string;
    deviceId: string;
    iat: string;
  }) {
    const issuedAt = new Date(+iat * 1000).toISOString();
    const session = await this.sessionsRepository.findSessionForCheckCookie(
      Number(userId),
      deviceId,
      issuedAt,
    );
    if (!session) {
      throw new UnauthorizedException();
    }
    return { userId, deviceId };
  }
}
