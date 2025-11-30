import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromptMessageRole } from '../entities';

export class UpdatePromptMessageDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsEnum(PromptMessageRole, {
    message: `role must be one of: ${Object.values(PromptMessageRole).join(', ')}`,
  })
  role: PromptMessageRole;

  @IsString()
  content: string;
}

export class UpdatePromptReqDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUUID()
  chatId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePromptMessageDto)
  messages?: UpdatePromptMessageDto[];
}

export class UpdatePromptResDto {
  id: string;
  name: string;
  content: string;
  chatId?: string;
  messages: { id: string; role: PromptMessageRole; content: string }[];
  createdAt: Date;
  updatedAt: Date;
}
