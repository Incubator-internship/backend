import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GitHubAuthInformation = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      email: request.user.email,
      providerId: request.user.githubId,
      providerType: request.user.providerType,
    };
  },
);
