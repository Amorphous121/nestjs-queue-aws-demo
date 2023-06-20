import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  VideoModifications,
  VideoModificationsSchema,
} from './modifications.schema';

export type VideoConversionDocument = HydratedDocument<VideoConversion>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class VideoConversion {
  @Prop()
  filePath: string;

  @Prop()
  convertedFilePath: string;

  @Prop({
    type: VideoModificationsSchema,
  })
  modifications: VideoModifications;

  @Prop({
    enum: ['pending', 'done', 'cancelled'],
    type: String,
    default: 'pending',
  })
  status: 'pending' | 'done' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export const VideoConversionSchema =
  SchemaFactory.createForClass(VideoConversion);
