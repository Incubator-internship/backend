import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostModelDTO } from '../api/models/input/posts-input.model';

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
}
