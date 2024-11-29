import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GitHubAuthInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      email: request.user.emails[0].value, // Предполагается, что вы получаете email из массива
      providerId: request.user.id, // ID пользователя GitHub
      providerType: 'github', // Указываем тип провайдера
    };
  },
);
