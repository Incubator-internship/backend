import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { AuthConfig } from 'apps/auth/settings/auth.config';
import { SessionsRepository } from '../../devices/infrastructure/sessions.repository';
import { UpcomingPaymentT } from '../types/types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'api/v1/payments/notification',
})
export class PaymentsNotification
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UsersRepository,
    private readonly authConfig: AuthConfig,
    private readonly sessionsRepository: SessionsRepository,
  ) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.headers['authorization'];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.authConfig.jwtSecret,
    });

    const { userId, deviceId } = payload;

    const user = await this.userRepository.getUserById(Number(userId));
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const issuedAt = new Date(+payload.iat * 1000).toISOString();
    const session = await this.sessionsRepository.findSessionForCheckCookie(
      userId,
      deviceId,
      issuedAt,
    );
    if (!session) {
      throw new UnauthorizedException();
    }

    client.join(userId.toString());
  }

  sendPaymentSuccess(userId: string, data: any) {
    this.server.to(userId).emit('payment.success', data);
  }
  sendUpcomingPaymentReminder(userId: string, data: UpcomingPaymentT) {
    this.server
      .to(userId)
      .emit(
        'payment.upcoming',
        `Следующий платеж у вас спишется через ${data.daysUntilExpiry} день`,
      );
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Клиент ${client.id} отключился`);
  }
}
