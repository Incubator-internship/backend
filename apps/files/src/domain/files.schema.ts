import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum FileType {
  avatar = 'avatar',
  post = 'post',
}

type ImageUrl = {
  small?: string;
  original?: string;
};
export enum FileFormat {
  jpg = 'jpg',
  png = 'png',
}
@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class FileEntity {
  @Prop({
    type: Number,
    required: true,
  })
  parentId: number;

  @Prop({
    type: String,
    required: true,
  })
  format: FileFormat;

  @Prop({
    type: String,
    required: true,
  })
  type: FileType;

  @Prop({ type: String, nullable: true, default: null })
  description: string | null;

  @Prop(
    raw({
      small: { type: String, required: false },
      original: { type: String, required: false },
    }),
  )
  url: ImageUrl;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  static create({
    parentId,
    format,
    type,
    description,
  }: {
    parentId: number;
    format: FileFormat;
    type: FileType;
    description?: string;
  }): FileDocument {
    const file = new this();
    file.parentId = parentId;
    file.format = format;
    file.type = type;
    file.description = description ? description : null;

    return file as FileDocument;
  }

  delete() {
    this.deletedAt = new Date();
  }
}

export const FileSchema = SchemaFactory.createForClass(FileEntity);

export type FileDocument = HydratedDocument<FileEntity>;

FileSchema.loadClass(FileEntity);
