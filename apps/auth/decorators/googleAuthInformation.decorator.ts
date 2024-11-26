import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GoogleAuthInformation = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      email: request.user.email,
      providerId: request.user.providerId,
      providerType: request.user.providerType,
    };
  },
);
