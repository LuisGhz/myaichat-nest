import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { OpenAIModel } from '../entities';

export class SendMessageReqDto {
  @IsOptional()
  @IsUUID()
  chatId?: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsEnum(OpenAIModel, {
    message: `model must be one of: ${Object.values(OpenAIModel).join(', ')}`,
  })
  model: OpenAIModel;

  @IsInt()
  @Min(1)
  @Max(16384)
  maxTokens: number;
}

export class SendMessageResDto {
  chatId: string;
  message: string;
  inputTokens: number;
  outputTokens: number;
  title?: string;
}
