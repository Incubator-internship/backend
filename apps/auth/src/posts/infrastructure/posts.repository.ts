import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostModelDTO } from '../api/models/input/posts-input.model';
import { Post } from '@prisma/client';

@Injectable()
export class PostsRepository {
  constructor(protected prismaService: PrismaService) {}

  async createPost(postDTO: PostModelDTO) {
    return this.prismaService.post.create({
      data: {
        content: postDTO.content,
        userId: postDTO.userId,
        photos: { create: postDTO.photoUrls.map((url) => ({ url })) },
      },
      include: { photos: true },
    });
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
}
