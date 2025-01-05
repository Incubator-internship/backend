import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostOutputModel } from '../api/models/output/posts.output.model';

@Injectable()
export class PostsQueryRepository {
  constructor(protected prismaService: PrismaService) {}

  async getAllPosts(): Promise<PostOutputModel[]> {
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

  async getPostByPostId(postId: number): Promise<PostOutputModel | null> {
    console.log(postId);
    const post = await this.prismaService.post.findUnique({
      where: { id: postId, deletedAt: null },
      include: { photos: true },
    });
    if (!post) {
      return null;
    }
    return {
      id: post.id,
      content: post.content,
      userId: post.userId,
      createdAt: post.createdAt,
      photos: post.photos,
    };
  }

  async getPostsByUserId(userId: number): Promise<PostOutputModel[]> {
    const allPosts = await this.prismaService.post.findMany({
      where: { userId, deletedAt: null },
      include: { photos: true },
    });
    allPosts.map((post) => {
      return {
        id: post.id,
        content: post.content,
        userId: post.userId,
        createdAt: post.createdAt,
        photos: post.photos,
      };
    });
    return allPosts;
  }
}
