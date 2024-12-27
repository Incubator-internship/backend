import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostOutputModel } from '../api/models/output/posts.output.model';

@Injectable()
export class PostsQueryRepository {
  constructor(protected prismaService: PrismaService) {}

  async getAllPosts(): Promise<PostOutputModel> {
    const allPosts = await this.prismaService.post.findMany({
      where: { deletedAt: null },
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
