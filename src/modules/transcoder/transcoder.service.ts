import * as path from 'path';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { unlink } from 'fs/promises';
import { InjectQueue } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { convertVideo } from './transcoder.utils';
import { ConvertVideoDto } from './dtos/convert-video.dto';
import { TRANSCODING_QUEUE } from 'src/constants/queue.constant';
import { VideoConversion } from './schemas/video-conversions.schema';

@Injectable()
export class TranscoderService {
  constructor(
    @InjectQueue(TRANSCODING_QUEUE) private readonly transcodingQueue: Queue,
    @InjectModel(VideoConversion.name)
    private readonly videoConversionModel: Model<VideoConversion>,
  ) {}

  async uploadFile(data: {
    filePath: string;
    convertVideoDto: ConvertVideoDto;
  }) {
    const conversion = await this.videoConversionModel.create({
      ...data,
      modifications: { ...data.convertVideoDto },
    });
    return conversion.toObject();
  }

  async getConversions() {
    return this.videoConversionModel.find().lean();
  }

  async cancleConversion(id: string) {
    const conversion = await this.videoConversionModel.findById(id);
    if (!conversion) throw new NotFoundException('Video not found!');
    conversion.status = 'cancelled';
    return conversion.save();
  }

  async deleteConversion(id: string) {
    try {
      const conversion = await this.videoConversionModel.findById(id);
      if (!conversion) throw new NotFoundException('Video not found!');
      await unlink(conversion.filePath);
      conversion.status = 'cancelled';
      conversion.deleteOne();
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async startConversion(id: string) {
    const conversion = await this.videoConversionModel.findById(id);
    if (!conversion) throw new NotFoundException('Video not found!');

    const { modifications, filePath } = conversion;
    await this.transcodingQueue.add('video', {
      id,
      filePath,
      modifications,
    });
    return { message: 'Job added for transcoding.' };
  }

  async startConversionV2(id: string) {
    const conversion = await this.videoConversionModel.findById(id);
    if (!conversion) throw new NotFoundException('Video not found!');
    const filePath = path.basename(conversion.filePath);
    const { modifications } = conversion;

    try {
      const conv = await this.videoConversionModel.findById(id).lean();

      if (conv.status === 'cancelled') {
        return Promise.resolve();
      }

      const pathObj = await convertVideo(filePath, modifications);
      const convertedFilePath = pathObj.convertedFilePath;

      const conversion = await this.videoConversionModel
        .findByIdAndUpdate(
          id,
          {
            $set: { convertedFilePath, status: 'done' },
          },
          { new: true },
        )
        .lean();
      return Promise.resolve(conversion);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
