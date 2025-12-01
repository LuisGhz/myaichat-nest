import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateModelDeveloperDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateModelPriceDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  input?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  output?: number;
}

export class UpdateModelMetadataDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  contextWindow?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOutputTokens?: number;

  @IsOptional()
  @IsString()
  knowledgeCutoff?: string;
}

export class UpdateModelReqDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  shortName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateModelPriceDto)
  price?: UpdateModelPriceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateModelMetadataDto)
  metadata?: UpdateModelMetadataDto;

  @IsOptional()
  @IsUUID()
  developerId?: string;
}

export class UpdateModelResDto {
  id: string;
  name: string;
  shortName: string;
  value: string;
  link: string;
  price: {
    input: number;
    output: number;
  };
  metadata: {
    contextWindow: number;
    maxOutputTokens: number;
    knowledgeCutoff: string;
  };
  developer: {
    id: string;
    name: string;
    link: string;
    imageUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
