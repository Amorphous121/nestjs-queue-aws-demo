import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
}

bootstrap();
