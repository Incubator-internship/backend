import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostInputModel {
  // @ApiProperty({
  //   required: false,
  //   description: 'Content description',
  //   maxLength: 500,
  //   example: 'some information about photo, this`s not mandatory',
  // })
  @ApiPropertyOptional({
    description: 'Some content which describes the photos. This is optional.',
    maxLength: 500,
    example: 'Some information about the photo, this is not mandatory.',
  })
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
