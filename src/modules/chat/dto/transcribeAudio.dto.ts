import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class TranscribeAudioReqDto {
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number = 0;
}

export class TranscribeAudioResDto {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}
