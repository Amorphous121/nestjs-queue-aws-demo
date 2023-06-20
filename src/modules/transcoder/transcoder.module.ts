import fsSynk from 'fs';
import { join } from 'path';
import fs from 'fs/promises';
import multerS3 from 'multer-s3';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { Module, OnApplicationBootstrap } from '@nestjs/common';

import {
  QUEUE_CONFIG_KEY,
  TRANSCODING_QUEUE,
} from 'src/constants/queue.constant';
import {
  VideoConversion,
  VideoConversionSchema,
} from './schemas/video-conversions.schema';
import { initializeS3Client } from './aws.utils';
import { TranscoderService } from './transcoder.service';
import { TranscoderConsumer } from './transcoder.consumer';
import { TranscoderController } from './transcoder.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoConversion.name, schema: VideoConversionSchema },
    ]),
    BullModule.registerQueue({
      configKey: QUEUE_CONFIG_KEY,
      name: TRANSCODING_QUEUE,
    }),
    MulterModule.register({
      storage: multerS3({
        s3: initializeS3Client(),
        key: (req, file, cb) => {
          cb(null, `input/${file.originalname}`);
        },
        bucket: process.env.AWS_BUCKET_NAME,
      }),
    }),
  ],
  providers: [TranscoderService, TranscoderConsumer],
  controllers: [TranscoderController],
})
export class TranscoderModule implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    const getFolderPath = (folderName: string) =>
      join(process.cwd(), 'src', 'public', 'files', folderName);

    for (const folder of ['input', 'output']) {
      const folderPath = getFolderPath(folder);
      if (!fsSynk.existsSync(folderPath)) {
        await fs.mkdir(folderPath, {
          recursive: true,
        });
      }
    }
  }
}
