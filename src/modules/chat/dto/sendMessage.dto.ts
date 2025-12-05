import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { IsValidModel } from '@mdl/validators';

export class SendMessageReqDto {
  @IsOptional()
  @IsUUID()
  chatId?: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  @IsValidModel({
    message: 'Invalid model. Please use a registered model value.',
  })
  model: string;

  @IsInt()
  @Min(1)
  @Max(16384)
  maxTokens: number;

  @IsOptional()
  file: File;

  @IsNumber()
  @Min(0)
  @Max(1)
  temperature: number;
}

export class SendMessageResDto {
  chatId: string;
  message: string;
  inputTokens: number;
  outputTokens: number;
  title?: string;
}
