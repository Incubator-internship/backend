import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostOutputModel } from '../api/models/output/posts.output.model';
import { GetAllPostsModel } from '../../auth/api/models/input/auth-input.model';
import log from 'eslint-plugin-react/lib/util/log';

@Injectable()
export class PostsQueryRepository {
  constructor(protected prismaService: PrismaService) {}

  async getAllPosts(
    getAllPostsModel: GetAllPostsModel,
  ) /*: Promise<PostOutputModel[]>*/ {
    const allPosts = await this.prismaService.post.findMany({
      take: getAllPostsModel.pageSize,
      skip: getAllPostsModel.cursor ? 1 : 0,
      cursor: getAllPostsModel.cursor
        ? { createdAt: getAllPostsModel.cursor }
        : undefined,
      where: { deletedAt: null },
      include: { photos: true },
      orderBy: { createdAt: 'desc' },
    });
    console.log('repository allPosts --->', allPosts);
    return allPosts.map((p) => {
      console.log('p.photos,', p.photos);
      return {
        id: p.id,
        content: p.content,
        userId: p.userId,
        createdAt: p.createdAt,
        photos: p.photos,
        ss:p.
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
