import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post } from '@prisma/client';
import { PrePostCreationModelDTO } from '../api/models/input/posts-input.model';

@Injectable()
export class PostsRepository {
  constructor(protected prismaService: PrismaService) {}

  async createPrePost(postDTO: PrePostCreationModelDTO): Promise<number> {
    const post = await this.prismaService.post.create({
      data: {
        content: postDTO.content,
        userId: postDTO.userId,
      },
    });
    return post.id;
  }

  async findPostById(postId: number): Promise<Post | null> {
    return this.prismaService.post.findUnique({ where: { id: postId } });
  }

  async updatePost(postId: number, content: string): Promise<void> {
    await this.prismaService.post.update({
      where: { id: postId },
      data: { content },
    });
  }
  async deletePost(postId: number): Promise<void> {
    await this.prismaService.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
  }
}
