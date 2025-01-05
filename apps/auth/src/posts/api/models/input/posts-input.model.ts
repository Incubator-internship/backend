import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostInputModel {
  @IsString()
  @MaxLength(500)
  content: string;
}
export class PostUpdateInputModel {
  @ApiProperty({
    required: true,
    description: 'Post description',
    minLength: 1,
    maxLength: 500,
    example: 'some information about photo',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
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
