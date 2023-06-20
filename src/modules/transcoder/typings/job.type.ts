import { ConvertVideoDto } from '../dtos/convert-video.dto';

export interface ITransoderJob {
  id: string;
  filePath: string;
  modifications: ConvertVideoDto;
}
