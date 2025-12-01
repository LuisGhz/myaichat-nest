import {
  IsNotEmpty,
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

export class CreateModelDeveloperDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsUrl()
  link: string;

  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;
}

export class CreateModelPriceDto {
  @IsNumber()
  @IsPositive()
  input: number;

  @IsNumber()
  @IsPositive()
  output: number;
}

export class CreateModelMetadataDto {
  @IsNumber()
  @Min(1)
  contextWindow: number;

  @IsNumber()
  @Min(1)
  maxOutputTokens: number;

  @IsNotEmpty()
  @IsString()
  knowledgeCutoff: string;
}

export class CreateModelReqDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  shortName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  value: string;

  @IsNotEmpty()
  @IsUrl()
  link: string;

  @ValidateNested()
  @Type(() => CreateModelPriceDto)
  price: CreateModelPriceDto;

  @ValidateNested()
  @Type(() => CreateModelMetadataDto)
  metadata: CreateModelMetadataDto;

  @IsOptional()
  @IsUUID()
  developerId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateModelDeveloperDto)
  developer?: CreateModelDeveloperDto;
}

export class CreateModelResDto {
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
