import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Provider } from '@prisma/client';

@Injectable()
export class UsersProvidersRepository {
  constructor(protected prismaService: PrismaService) {}

  async createUserProvider(providerDTO: CreateUserProviderDTO) {
    await this.prismaService.provider.create({ data: providerDTO });
  }

  async findProviderByProviderId(providerId: string): Promise<Provider | null> {
    return this.prismaService.provider.findFirst({
      where: { providerId },
    });
  }
}
