import { PostModelDTO } from '../../api/models/input/posts-input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand {
  constructor(public readonly postDTO: PostModelDTO) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: CreatePostCommand): Promise<number> {
    return await this.postsRepository.createPost(command.postDTO);
  }
}
