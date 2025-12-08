import { Transform } from 'class-transformer';
import {
  IsBoolean,
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

  @IsOptional()
  @IsUUID()
  promptId?: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  @IsValidModel({
    message: 'Invalid model. Please use a registered model value.',
  })
  model: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(16384)
  maxTokens: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature: number;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isImageGeneration: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isWebSearch: boolean;
}

export class SendMessageResDto {
  chatId: string;
  message: string;
  inputTokens: number;
  outputTokens: number;
  title?: string;
}
