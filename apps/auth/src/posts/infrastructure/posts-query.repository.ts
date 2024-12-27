import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PostsQueryRepository {
  constructor(protected prismaService: PrismaService) {}

  async getAllPosts() {
    const allPosts = await this.prismaService.post.findMany({
      include: { photos: true },
    });
    return allPosts.map((p) => {
      return {
        id: p.id,
        content: p.content,
        userId: p.userId,
        createdAt: p.createdAt,
        photos: p.photos,
      };
    });
  }
}
