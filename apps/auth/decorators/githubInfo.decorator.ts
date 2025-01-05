import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GitHubAuthInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      email: request.user.email, // Предполагается, что вы получаете email из массива
      providerId: request.user.providerId, // ID пользователя GitHub
      providerType: request.user.providerType, // Указываем тип провайдера
    };
  },
);
