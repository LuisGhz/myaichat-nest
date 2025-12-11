import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ModelsService } from './services';
import {
  CreateModelReqDto,
  CreateModelResDto,
  UpdateModelReqDto,
  UpdateModelResDto,
  ModelResDto,
  ModelListItemResDto,
  DeveloperListItemResDto,
} from './dto';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  async create(@Body() dto: CreateModelReqDto): Promise<CreateModelResDto> {
    return this.modelsService.create(dto);
  }

  @Get()
  async findAll(): Promise<ModelListItemResDto[]> {
    return this.modelsService.findAll();
  }

  @Get('developers')
  async getDevelopers(): Promise<DeveloperListItemResDto[]> {
    return this.modelsService.getDevelopers();
  }

  @Get('by-value')
  async findByValue(@Query('value') value: string): Promise<ModelResDto> {
    const data = await this.modelsService.findByValue(value);
    return data;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ModelResDto> {
    return this.modelsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModelReqDto,
  ): Promise<UpdateModelResDto> {
    return this.modelsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.modelsService.remove(id);
  }
}
