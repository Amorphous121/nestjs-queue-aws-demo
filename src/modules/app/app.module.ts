import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { BullBoardModule } from '@nestql/bull-board';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { TranscoderModule } from '../transcoder/transcoder.module';
import { QUEUE_CONFIG_KEY, QUEUE_PREFIX } from 'src/constants/queue.constant';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    BullModule.forRootAsync(QUEUE_CONFIG_KEY, {
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          redis: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            password: configService.get<string>('REDIS_PASSWORD'),
            username: configService.get<string>('REDIS_USERNAME'),
          },
          prefix: QUEUE_PREFIX,
        };
      },
    }),
    BullBoardModule.register({
      autoAdd: true,
      path: 'admin-board',
      queueOptions: { allowRetries: true },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL'),
      }),
    }),
    TranscoderModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
