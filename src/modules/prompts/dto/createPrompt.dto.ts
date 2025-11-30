import {
  IsNotEmpty,
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

export class CreatePromptMessageDto {
  @IsEnum(PromptMessageRole, {
    message: `role must be one of: ${Object.values(PromptMessageRole).join(', ')}`,
  })
  role: PromptMessageRole;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export class CreatePromptReqDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  chatId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePromptMessageDto)
  messages?: CreatePromptMessageDto[];
}

export class CreatePromptResDto {
  id: string;
  name: string;
  content: string;
  chatId?: string;
  messages: { id: string; role: PromptMessageRole; content: string }[];
  createdAt: Date;
  updatedAt: Date;
}
