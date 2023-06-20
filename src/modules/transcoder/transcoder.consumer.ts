import { Model } from 'mongoose';
import { DoneCallback, Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Processor, Process, OnQueueCompleted } from '@nestjs/bull';

import { convertVideo } from './transcoder.utils';
import { ITransoderJob } from './typings/job.type';
import { TRANSCODING_QUEUE } from 'src/constants/queue.constant';
import { VideoConversion } from './schemas/video-conversions.schema';

@Processor(TRANSCODING_QUEUE)
export class TranscoderConsumer {
  constructor(
    @InjectModel(VideoConversion.name)
    private readonly videoConversionModel: Model<VideoConversion>,
  ) {}

  @Process({
    name: 'video',
    concurrency: 2,
  })
  async changeFormat(job: Job<ITransoderJob>, done: DoneCallback) {
    const { id, filePath, modifications } = job.data;
    try {
      const conv = await this.videoConversionModel.findById(id).lean();

      if (conv.status === 'cancelled') {
        return Promise.resolve();
      }

      const pathObj = await convertVideo(filePath, modifications, job);
      const convertedFilePath = pathObj.convertedFilePath;

      const conversion = await this.videoConversionModel
        .findByIdAndUpdate(id, {
          $set: { convertedFilePath, status: 'done' },
        })
        .lean();

      done(null, conversion);
      return Promise.resolve(conversion);
    } catch (error) {
      done(error);
      Promise.reject(error);
    }
  }

  @OnQueueCompleted({ name: 'video' })
  jobComplete(job: Job<ITransoderJob>) {
    console.log(`\t\t\t=̷=̷=̷=̷=̷=̷=̷=̷>̷  ${job.id} <̷=̷=̷=̷=̷=̷=̷=̷=̷`);
    console.log(` 
      ░░█ █▀█ █▄▄   █▀▀ █▀█ █▀▄▀█ █▀█ █░░ █▀▀ ▀█▀ █▀▀ █▀▄
      █▄█ █▄█ █▄█   █▄▄ █▄█ █░▀░█ █▀▀ █▄▄ ██▄ ░█░ ██▄ █▄▀
    `);
  }
}
