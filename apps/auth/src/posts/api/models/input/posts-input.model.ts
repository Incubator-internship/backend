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
export class UpdatePostModelDTO {
  postId: number;
  content: string;
  userId: number;
}
export class DeleteePostModelDTO {
  postId: number;
  userId: number;
}
