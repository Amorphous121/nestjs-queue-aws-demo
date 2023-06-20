import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type VideoConversionDocument = HydratedDocument<VideoModifications>;

@Schema({
  _id: false,
  versionKey: false,
})
export class VideoModifications {
  @Prop({
    default: null,
  })
  seekInput: string;

  @Prop({
    default: false,
  })
  withoutAudio: boolean;

  @Prop({
    default: false,
  })
  withoutVdeo: boolean;

  @Prop({
    default: null,
  })
  outputFPS: number;

  @Prop({
    default: null,
  })
  frameSize: string;

  @Prop({
    default: null,
  })
  seekOutput: string;

  @Prop({
    default: null,
  })
  format: string;

  @Prop({
    default: null,
  })
  videoBitrate: number;

  @Prop({
    default: null,
  })
  audioBitrate: string;
}

export const VideoModificationsSchema =
  SchemaFactory.createForClass(VideoModifications);
