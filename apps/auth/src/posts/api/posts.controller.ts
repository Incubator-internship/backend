import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PostInputModel, PostModelDTO } from './models/input/posts-input.model';
import { JwtAccessAuthGuard } from '../../../guards/jwt/jwt-header.strategy';
import { TakeUserId } from '../../../decorators/authMeTakeUserId.decorator';
import { CreatePostCommand } from '../application/use.cases/createPost.command';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import { PostsQueryRepository } from '../infrastructure/posts-query.repository';
import { UpdatePostCommand } from '../application/use.cases/updatePost.command';
import { DeletePostCommand } from '../application/use.cases/deletePost.command';

@ApiTags('Posts')
@UseGuards(ThrottlerGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private httpService: HttpService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get('all-posts')
  async getAllPosts() {
    return await this.postsQueryRepository.getAllPosts();
  }

  @Post('post')
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(204)
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // limit 2mb per photo
        files: 10, // limit 10 photos
        fieldSize: 20 * 1024 * 1024, // limit 20mb for all photos
      },
    }),
  )
  async createMultiplePost(
    @TakeUserId() { userId }: { userId: number },
    @Body() content: PostInputModel,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    //Check, user has to download min 1 photo
    if (photos.length === 0) {
      throw new BadRequestException('At least one photo is required.');
    }

    const photoUrls = [];

    for (const photo of photos) {
      const formData = new FormData();
      console.log('formData ', formData);
      // formData.append('file', photo.buffer, photo.originalname);
      formData.append('files', photo.buffer, {
        filename: photo.originalname,
        contentType: photo.mimetype,
      });
      console.log('formData with append file ', formData);
      const response = await firstValueFrom(
        this.httpService.post(
          'http://localhost:5001/api/v1/file/post-files',
          formData,
          { headers: { ...formData.getHeaders() } },
        ),
      );
      console.log('response ', response);
      if (!response.data.urls) {
        console.error('No URLs returned from Files service');
        throw new BadRequestException('No URLs returned from Files service');
      }
      photoUrls.push(...response.data.urls);
    }

    const postDTO: PostModelDTO = { ...content, photoUrls, userId };
    return await this.commandBus.execute(new CreatePostCommand(postDTO)); // Сохранение поста и фотографий в базе данных
  }

  @Put(':id')
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(204)
  async updatePostByPostId(
    @TakeUserId() { userId }: { userId: number },
    @Param('id', ParseIntPipe) postId: number,
    @Body() inputModel: PostInputModel,
  ) {
    await this.commandBus.execute(
      new UpdatePostCommand({ postId, content: inputModel.content, userId }),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(204)
  async deletePostByPostId(
    @TakeUserId() { userId }: { userId: number },
    @Param('id', ParseIntPipe) postId: number,
  ) {
    await this.commandBus.execute(new DeletePostCommand({ userId, postId }));
  }
}
