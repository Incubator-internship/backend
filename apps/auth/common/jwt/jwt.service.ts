import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../../settings/auth.config';

@Injectable()
export class JWTService {
  constructor(
    private jwtService: JwtService,
    private configService: AuthConfig,
  ) {}

  async createJWT(userId: number, deviceId: string) {
    // const secretKey = this.configService.get('JwtSettings.JWT_SECRET', {
    //   infer: true,
    // });
    const secretKey = this.configService.jwtSecret;
    //todo after testing delete console.log below
    console.log('secretKey JWTService in jwt service', secretKey);

    if (!secretKey) {
      throw new Error('Invalid JWT_SECRET');
    }
    return {
      accessToken: await this.jwtService.signAsync(
        { userId, deviceId },
        {
          secret: secretKey,
          expiresIn: '600m',
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        { userId, deviceId },
        {
          secret: /*appSettings.api.JWT_SECRET ||*/ '12345',
          expiresIn: '600m',
        },
      ),
    };
  }
}
