import {
  Min,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';

enum AudioBitRates {
  '64kbps',
  '128kbps',
  '256kbps',
  '320kbps',
}

export class ConvertVideoDto {
  @IsString()
  @IsOptional()
  seekInput: string;

  @IsBoolean()
  @IsOptional()
  withoutAudio: boolean;

  @IsBoolean()
  @IsOptional()
  withoutVdeo: boolean;

  @Min(1)
  @IsNumber()
  @IsOptional()
  outputFPS: number;

  @IsString()
  @IsOptional()
  frameSize: string;

  @IsString()
  @IsOptional()
  seekOutput: string;

  @IsString()
  @IsOptional()
  format: string;

  @IsNumber()
  @IsOptional()
  @Min(1000, { message: 'Video Bitrates should be equal or more than 1000.' })
  videoBitrate: number;

  @IsString()
  @IsOptional()
  @IsEnum(AudioBitRates)
  audioBitrate: string;
}
