import { Module } from '@nestjs/common';
import { PostsController } from './posts/api/posts.controller';
import { CreatePostHandler } from './posts/application/use.cases/createPost.command';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';

const commands = [CreatePostHandler];
const repositories = [PostsRepository];
const service = [PrismaService];

@Module({
  imports: [
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
