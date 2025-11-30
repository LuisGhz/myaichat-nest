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
} from '@nestjs/common';
import { CurrentUser } from '@cmn/decorators';
import type { JwtPayload } from '@cmn/interfaces';
import { PromptsService } from './services';
import {
  CreatePromptReqDto,
  CreatePromptResDto,
  UpdatePromptReqDto,
  UpdatePromptResDto,
  PromptResDto,
  PromptListItemResDto,
} from './dto';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  async create(
    @Body() dto: CreatePromptReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CreatePromptResDto> {
    return this.promptsService.create(dto, user.sub);
  }

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<PromptListItemResDto[]> {
    return this.promptsService.findAll(user.sub);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<PromptResDto> {
    return this.promptsService.findOne(id, user.sub);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromptReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UpdatePromptResDto> {
    return this.promptsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.promptsService.remove(id, user.sub);
  }
}
