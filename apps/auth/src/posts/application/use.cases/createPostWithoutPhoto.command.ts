import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PrePostCreationModelDTO } from '../../api/models/input/posts-input.model';

export class CreatePostWithoutPhotoCommand {
  constructor(public readonly prePostDTO: PrePostCreationModelDTO) {}
}

@CommandHandler(CreatePostWithoutPhotoCommand)
export class CreatePostWithoutPhotoCommandHandler
  implements ICommandHandler<CreatePostWithoutPhotoCommand>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: CreatePostWithoutPhotoCommand): Promise<number> {
    return await this.postsRepository.createPrePost(command.prePostDTO);
  }
}
