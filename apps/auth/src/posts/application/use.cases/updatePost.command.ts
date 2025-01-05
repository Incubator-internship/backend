import { UpdatePostModelDTO } from '../../api/models/input/posts-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';

export class UpdatePostCommand {
  constructor(public readonly updatePostDTO: UpdatePostModelDTO) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findPostById(
      command.updatePostDTO.postId,
    );
    if (!post || post.deletedAt) {
      return exceptionHandler(
        ResultCode.NotFound,
        'Post has been not found',
        'postId',
      );
    }
    if (post.userId !== command.updatePostDTO.userId) {
      return exceptionHandler(
        ResultCode.Forbidden,
        'You do`t have permission to edit this post.',
        'Forbidden',
      );
    }
    await this.postsRepository.updatePost(
      command.updatePostDTO.postId,
      command.updatePostDTO.content,
    );
  }
}
