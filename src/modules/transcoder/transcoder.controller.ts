import {
  Get,
  Put,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Controller,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { TranscoderService } from './transcoder.service';
import { ConvertVideoDto } from './dtos/convert-video.dto';
import { VALID_VIDEO_EXTENSIONS } from 'src/utils/file.util';

@Controller('/transcode')
export class TranscoderController {
  constructor(private readonly encoderService: TranscoderService) {}

  @Get()
  getConversions() {
    return this.encoderService.getConversions();
  }

  @Get('start/:id')
  startConversion(@Param('id') id: string) {
    return this.encoderService.startConversion(id);
  }

  @Get('start/v2/:id')
  startConversionV2(@Param('id') id: string) {
    return this.encoderService.startConversionV2(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: VALID_VIDEO_EXTENSIONS,
        })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: any,
    @Body() convertVideoDto: ConvertVideoDto,
  ) {
    const { key } = file;
    return this.encoderService.uploadFile({ filePath: key, convertVideoDto });
  }

  @Put('/cancel/:id')
  cancleConversion(@Param('id') id: string) {
    return this.encoderService.cancleConversion(id);
  }

  @Delete('/:id')
  deleteConversion(@Param('id') id: string) {
    return this.encoderService.deleteConversion(id);
  }
}
