import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NestInterceptor,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  PostInputModel,
  PostUpdateInputModel,
} from './models/input/posts-input.model';
import { JwtAccessAuthGuard } from '../../../guards/jwt/jwt-header.strategy';
import { TakeUserId } from '../../../decorators/authMeTakeUserId.decorator';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import { PostsQueryRepository } from '../infrastructure/posts-query.repository';
import { UpdatePostCommand } from '../application/use.cases/updatePost.command';
import { DeletePostCommand } from '../application/use.cases/deletePost.command';
import {
  CreatePostEndpoint,
  DeletePostEndpoint,
  GetAllPostsEndpoint,
  GetPostByPostIdEndpoint,
  GetPostsByUserIdEndpoint,
  UpdatePostEndpoint,
} from '../../../swagger/posts.swagger';
import {
  exceptionHandler,
  ResultCode,
} from '../../../common/exception-filters/exception.handler';
import { GetAllPostsModel } from '../../auth/api/models/input/auth-input.model';
import { AuthConfig } from '../../../settings/auth.config';
import { PostFileUploadInterceptor } from '../../../common/helpers/fileUploadInterceptor.helper';
import { CreatePostWithoutPhotoCommand } from '../application/use.cases/createPostWithoutPhoto.command';

@ApiTags('Posts')
@UseGuards(ThrottlerGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private httpService: HttpService,
    private postsQueryRepository: PostsQueryRepository,
    private authConfig: AuthConfig,
  ) {}

  @GetAllPostsEndpoint()
  @Get('all-posts')
  async getAllPosts(@Query() getAllPostsModel: GetAllPostsModel) {
    return await this.postsQueryRepository.getAllPosts(getAllPostsModel);
  }

  @CreatePostEndpoint()
  @Post('post')
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(201)
  @UseInterceptors(PostFileUploadInterceptor)
  async createMultiplePost(
    @TakeUserId() { userId }: { userId: number },
    @Body() content: PostInputModel,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    console.log(content, 'content');
    //Check, user has to download min 1 photo
    if (photos.length === 0) {
      throw new BadRequestException([
        {
          message: 'At least one photo is required.',
          field: 'create post',
        },
      ]);
    }

    const test = { content, userId };
    const postId = await this.commandBus.execute(
      new CreatePostWithoutPhotoCommand(test),
    );

    const photoUrls: string[] = [];

    for (const photo of photos) {
      const formData = new FormData();
      formData.append('files', photo.buffer, {
        filename: photo.originalname,
        contentType: photo.mimetype,
      });
      const response = await firstValueFrom(
        this.httpService.post(
          this.authConfig.uploadPhotosForPostFileMicroservice,
          //todo delete links below
          //'http://localhost:5001/api/v1/file/post-files',
          //'https://files.excubator.xyz:443/api/v1/file/post-files',
          formData,
          { headers: { ...formData.getHeaders() } },
        ),
      );
      if (!response.data.urls) {
        throw new BadRequestException('No URLs returned from Files service');
      }
      photoUrls.push(...response.data.urls);
    }
    // const postDTO: PostModelDTO = { ...content, photoUrls, userId };
    // const postId = await this.commandBus.execute(
    //   new CreatePostCommand(postDTO),
    // ); // Сохранение поста и фотографий в базе данных
    return { postId };
  }

  @UpdatePostEndpoint()
  @Put(':id')
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(204)
  async updatePostByPostId(
    @TakeUserId() { userId }: { userId: number },
    @Param('id', ParseIntPipe) postId: number,
    @Body() inputModel: PostUpdateInputModel,
  ) {
    await this.commandBus.execute(
      new UpdatePostCommand({ postId, content: inputModel.content, userId }),
    );
  }

  @DeletePostEndpoint()
  @Delete(':id')
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(204)
  async deletePostByPostId(
    @TakeUserId() { userId }: { userId: number },
    @Param('id', ParseIntPipe) postId: number,
  ) {
    await this.commandBus.execute(new DeletePostCommand({ userId, postId }));
  }

  @GetPostByPostIdEndpoint()
  @Get(':id')
  @HttpCode(200)
  async getPostByPostId(@Param('id', ParseIntPipe) postId: number) {
    const post = await this.postsQueryRepository.getPostByPostId(postId);
    if (!post) {
      return exceptionHandler(
        ResultCode.NotFound,
        'Post has been not found',
        'PostId',
      );
    }
    return post;
  }

  @GetPostsByUserIdEndpoint()
  @Get('/user-posts/:userId')
  @HttpCode(200)
  async getPostsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.postsQueryRepository.getPostsByUserId(userId);
  }
}
