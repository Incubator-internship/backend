import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { appSettings } from '../../settings/configuration';
//config();

@Injectable()
export class JWTService {
  constructor(
    private jwtService: JwtService,
    //private configService: ConfigService<ConfigurationType, true>,
  ) {}

  async createJWT(userId: number, deviceId: string) {
    // const secretKey = this.configService.get('JwtSettings.JWT_SECRET', {
    //   infer: true,
    // });
    const secretKey = appSettings.api.JWT_SECRET;
    console.log('secretKey JWTService', secretKey);

    if (!secretKey) {
      throw new Error('Invalid JWT_SECRET');
    }
    return {
      accessToken: await this.jwtService.signAsync(
        { userId },
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
