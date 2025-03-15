import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { FileEntity } from '../domain/files.schema';
import { Model } from 'mongoose';

@Injectable()
export class FilesRepository {
  constructor(
    @InjectModel(FileEntity.name) private FileModel: Model<FileEntity>,
  ) {}

  async createFile(createFileDTO: FileEntity): Promise<void> {
    const file = new this.FileModel(createFileDTO);
    await file.save();
  }
}
