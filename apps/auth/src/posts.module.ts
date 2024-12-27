import { Module } from '@nestjs/common';
import { PostsController } from './posts/api/posts.controller';
import { CreatePostHandler } from './posts/application/use.cases/createPost.command';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { HttpModule } from '@nestjs/axios';
import { PostsQueryRepository } from './posts/infrastructure/posts-query.repository';
import { UpdatePostHandler } from './posts/application/use.cases/updatePost.command';
import { DeletePostHandler } from './posts/application/use.cases/deletePost.command';

const commands = [CreatePostHandler, UpdatePostHandler, DeletePostHandler];
const repositories = [PostsRepository, PostsQueryRepository];
const service = [PrismaService];

@Module({
  imports: [
    HttpModule,
    CqrsModule,
    MulterModule.register({
      dest: 'E:/BackEnd/backendIntership/photoForMyProject',
    }),
  ],
  controllers: [PostsController],
  providers: [...repositories, ...service, ...commands],
  exports: [],
})
export class PostsModule {}
