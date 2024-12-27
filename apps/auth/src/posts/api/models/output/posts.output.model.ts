import { ApiProperty } from '@nestjs/swagger';

export class PhotoOutputModel {
  @ApiProperty({ example: 1, description: 'Unique identifier for the photo' })
  id: number;

  @ApiProperty({
    example: 'http://example.com/photo.jpg',
    description: 'URL of the photo',
  })
  url: string;

  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the related post',
  })
  postId: number;
}

export class PostOutputModel {
  @ApiProperty({ example: 1, description: 'Unique identifier for the post' })
  id: number;

  @ApiProperty({ example: 'Post content', description: 'Content of the post' })
  content: string;

  @ApiProperty({ example: 1, description: 'Unique identifier for the user' })
  userId: number;

  @ApiProperty({
    example: '2024-12-26T10:20:24.000Z',
    description: 'Creation date of the post',
  })
  createdAt: Date;

  @ApiProperty({
    type: [PhotoOutputModel],
    description: 'Array of photos related to the post',
  })
  photos: PhotoOutputModel[];
}
