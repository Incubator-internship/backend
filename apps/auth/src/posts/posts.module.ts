import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { CreatePostHandler } from './application/use.cases/createPost.command';
import { PostsRepository } from './infrastructure/posts.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { HttpModule } from '@nestjs/axios';
import { PostsQueryRepository } from './infrastructure/posts-query.repository';
import { UpdatePostHandler } from './application/use.cases/updatePost.command';
import { DeletePostHandler } from './application/use.cases/deletePost.command';
import { AuthConfig } from '../../settings/auth.config';

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
  providers: [AuthConfig, ...repositories, ...service, ...commands],
  exports: [],
})
export class PostsModule {}
