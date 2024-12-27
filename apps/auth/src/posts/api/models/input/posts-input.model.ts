import { IsString, MaxLength } from 'class-validator';

export class PostInputModel {
  @IsString()
  @MaxLength(500)
  content: string;
}

export class PostModelDTO {
  content: string;
  photoUrls: string[];
  userId: number;
}
export class updatePostModelDTO {
  postId: number;
  content: string;
  userId: number;
}
