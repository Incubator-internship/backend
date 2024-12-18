import { IsString, MaxLength } from 'class-validator';

export class CreatePostInputModel {
  @IsString()
  @MaxLength(500)
  content: string;
}

export class PostModelDTO {
  content: string;
  photoUrls: string[];
  userId: number;
}
