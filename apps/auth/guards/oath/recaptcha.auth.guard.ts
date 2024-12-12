import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UsersRepository } from '../../src/users/infrastructure/users.repository';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';

type RecaptchaResponse = {
  success: true | false;
  challenge_ts: string;
  hostname: string;
  action: string;
  score: number;
};

@Injectable()
export class RecaptchaAuthGuard implements CanActivate {
  constructor(
    private readonly httpService: HttpService,
    //private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly usersRepository: UsersRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    console.log(RecaptchaAuthGuard);
    const recaptchaToken = request.body.recaptchaToken;
    const userEmail = request.body.email;
    console.log('recaptchaToken ', recaptchaToken);
    console.log('userEmail ', userEmail);

    if (!recaptchaToken) {
      throw new ForbiddenException('reCAPTCHA token missing');
    }

    await this.checkEmail({ email: userEmail });

    const score = await this.getScore({ recaptchaToken });
    this.checkScore({ score });
    console.log('score ', score);
    return true;
  }

  private async checkEmail({ email }: { email: string }) {
    if (!email) {
      console.log('it`s not email');
      throw new ForbiddenException('user email missing');
    }

    const user = await this.usersRepository.findUserByEmail(email);

    if (!user) {
      console.log('it`s not user');
      throw new BadRequestException(`User with this email doesn't exist`);
    }
  }

  private async getScore({
    recaptchaToken,
  }: {
    recaptchaToken: string;
  }): Promise<number> {
    // секретный ключ reCAPTCHA
    //todo Need put this in env
    const secretKey = '6LcghJMqAAAAAGUeTXwJ-m166AP7BoxmXAS4A6ax';
    const recaptchaURL = 'https://www.google.com/recaptcha/api/siteverify';

    const response = await lastValueFrom(
      this.httpService.post<RecaptchaResponse>(recaptchaURL, null, {
        params: {
          secret: secretKey,
          response: recaptchaToken,
        },
      }),
    );
    console.log('getScore response ', response);
    const { score } = response.data;
    console.log('getScore response ', score);
    return score;
  }

  private checkScore({ score }: { score: number }) {
    if (!score) {
      throw new ForbiddenException('reCAPTCHA verification failed');
    }

    if (score < 0.9) {
      throw new ForbiddenException(
        'probability that the request was made by a bot',
      );
    }
  }
}
