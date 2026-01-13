import { DeleteePostModelDTO } from '../../api/models/input/posts-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import {
  exceptionHandler,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';

export class DeletePostCommand {
  constructor(public readonly deletePostDTO: DeleteePostModelDTO) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findPostById(
      command.deletePostDTO.postId,
    );
    if (!post || post.deletedAt) {
      return exceptionHandler(
        ResultCode.NotFound,
        'Post has been not found',
        'delete post',
      );
    }
    if (post.userId !== command.deletePostDTO.userId) {
      return exceptionHandler(
        ResultCode.Forbidden,
        'You do`t have permission to edit this post.',
        'delete post',
      );
    }
    await this.postsRepository.deletePost(command.deletePostDTO.postId);
  }
}
