import { IsBoolean } from 'class-validator';

export class UpdateAIFeaturesReqDto {
  @IsBoolean()
  isWebSearch: boolean;

  @IsBoolean()
  isImageGeneration: boolean;
}
