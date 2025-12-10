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
} from './dto';
import { AppCacheService } from '@cmn/services/app-cache.service';
import { CACHE_KEYS } from '@cmn/consts/cache.const';

@Controller('models')
export class ModelsController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly appCacheService: AppCacheService,
  ) {}

  @Post()
  async create(@Body() dto: CreateModelReqDto): Promise<CreateModelResDto> {
    this.appCacheService.del(CACHE_KEYS.MODELS_FIND_ALL);
    return this.modelsService.create(dto);
  }

  @Get()
  async findAll(): Promise<ModelListItemResDto[]> {
    const cachedData = await this.appCacheService.get<ModelListItemResDto[]>(
      CACHE_KEYS.MODELS_FIND_ALL,
    );
    if (cachedData) return cachedData;
    const data = await this.modelsService.findAll();
    await this.appCacheService.setShort(CACHE_KEYS.MODELS_FIND_ALL, data);
    return data;
  }

  @Get('by-value')
  async findByValue(@Query('value') value: string): Promise<ModelResDto> {
    return this.modelsService.findByValue(value);
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
    this.appCacheService.del(CACHE_KEYS.MODELS_FIND_ALL);
    return this.modelsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.appCacheService.del(CACHE_KEYS.MODELS_FIND_ALL);
    return this.modelsService.remove(id);
  }
}
