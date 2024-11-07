import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from '../../src/users/infrastructure/users.repository';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard('jwt-header') {}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-header',
) {
  constructor(private readonly userRepositorySQL: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate({ userId }: { userId: number }) {
    console.log('userId', userId);
    const user = await this.userRepositorySQL.getUserById(Number(userId));
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId };
  }
}
