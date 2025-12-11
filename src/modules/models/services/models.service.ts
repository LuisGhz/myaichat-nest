import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model, ModelDeveloper } from '../entities';
import {
  CreateModelReqDto,
  CreateModelResDto,
  UpdateModelReqDto,
  UpdateModelResDto,
  ModelResDto,
  ModelListItemResDto,
} from '../dto';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
    @InjectRepository(ModelDeveloper)
    private readonly developerRepository: Repository<ModelDeveloper>,
  ) {}

  async create(dto: CreateModelReqDto): Promise<CreateModelResDto> {
    const existingModel = await this.modelRepository.findOne({
      where: { value: dto.value },
    });

    if (existingModel) {
      throw new BadRequestException(
        `Model with value "${dto.value}" already exists`,
      );
    }

    let developer: ModelDeveloper;

    if (dto.developerId) {
      const foundDeveloper = await this.developerRepository.findOne({
        where: { id: dto.developerId },
      });

      if (!foundDeveloper) {
        throw new NotFoundException(
          `Developer with id ${dto.developerId} not found`,
        );
      }

      developer = foundDeveloper;
    } else if (dto.developer) {
      let existingDeveloper = await this.developerRepository.findOne({
        where: { name: dto.developer.name },
      });

      if (!existingDeveloper) {
        existingDeveloper = this.developerRepository.create({
          name: dto.developer.name,
          link: dto.developer.link,
          imageUrl: dto.developer.imageUrl,
        });
        existingDeveloper =
          await this.developerRepository.save(existingDeveloper);
      }

      developer = existingDeveloper;
    } else {
      throw new BadRequestException(
        'Either developerId or developer must be provided',
      );
    }

    const model = this.modelRepository.create({
      name: dto.name,
      shortName: dto.shortName,
      value: dto.value,
      link: dto.link,
      guestAccess: dto.guestAccess ?? false,
      priceInput: dto.price.input,
      priceOutput: dto.price.output,
      contextWindow: dto.metadata.contextWindow,
      maxOutputTokens: dto.metadata.maxOutputTokens,
      knowledgeCutoff: dto.metadata.knowledgeCutoff,
      developer,
    });

    const savedModel = await this.modelRepository.save(model);

    return this.mapToResponseDto(savedModel);
  }

  async findAll(): Promise<ModelListItemResDto[]> {
    const models = await this.modelRepository.find({
      relations: ['developer'],
      order: { name: 'ASC' },
    });

    return models.map((model) => ({
      id: model.id,
      name: model.name,
      shortName: model.shortName,
      value: model.value,
      guestAccess: model.guestAccess,
      developer: {
        name: model.developer.name,
        imageUrl: model.developer.imageUrl,
      },
    }));
  }

  async findOne(id: string): Promise<ModelResDto> {
    const model = await this.findByIdOrFail(id);
    return this.mapToResponseDto(model);
  }

  async findByValue(value: string): Promise<ModelResDto> {
    const model = await this.modelRepository.findOne({
      where: { value },
      relations: ['developer'],
    });

    if (!model) {
      throw new NotFoundException(`Model with value "${value}" not found`);
    }

    return this.mapToResponseDto(model);
  }

  async update(id: string, dto: UpdateModelReqDto): Promise<UpdateModelResDto> {
    const model = await this.findByIdOrFail(id);

    if (dto.name !== undefined) {
      model.name = dto.name;
    }

    if (dto.shortName !== undefined) {
      model.shortName = dto.shortName;
    }

    if (dto.value !== undefined) {
      const existingModel = await this.modelRepository.findOne({
        where: { value: dto.value },
      });

      if (existingModel && existingModel.id !== id) {
        throw new BadRequestException(
          `Model with value "${dto.value}" already exists`,
        );
      }

      model.value = dto.value;
    }

    if (dto.link !== undefined) {
      model.link = dto.link;
    }

    if (dto.guestAccess !== undefined) {
      model.guestAccess = dto.guestAccess;
    }

    if (dto.price !== undefined) {
      if (dto.price.input !== undefined) {
        model.priceInput = dto.price.input;
      }
      if (dto.price.output !== undefined) {
        model.priceOutput = dto.price.output;
      }
    }

    if (dto.metadata !== undefined) {
      if (dto.metadata.contextWindow !== undefined) {
        model.contextWindow = dto.metadata.contextWindow;
      }
      if (dto.metadata.maxOutputTokens !== undefined) {
        model.maxOutputTokens = dto.metadata.maxOutputTokens;
      }
      if (dto.metadata.knowledgeCutoff !== undefined) {
        model.knowledgeCutoff = dto.metadata.knowledgeCutoff;
      }
    }

    if (dto.developerId !== undefined) {
      const developer = await this.developerRepository.findOne({
        where: { id: dto.developerId },
      });

      if (!developer) {
        throw new NotFoundException(
          `Developer with id ${dto.developerId} not found`,
        );
      }

      model.developer = developer;
    }

    const savedModel = await this.modelRepository.save(model);

    return this.mapToResponseDto(savedModel);
  }

  async remove(id: string): Promise<void> {
    const model = await this.findByIdOrFail(id);
    await this.modelRepository.remove(model);
  }

  async getDevelopers(): Promise<ModelDeveloper[]> {
    return this.developerRepository.find({
      order: { name: 'ASC' },
    });
  }

  async existsByValue(value: string): Promise<boolean> {
    const count = await this.modelRepository.count({
      where: { value },
    });
    return count > 0;
  }

  private async findByIdOrFail(id: string): Promise<Model> {
    const model = await this.modelRepository.findOne({
      where: { id },
      relations: ['developer'],
    });

    if (!model) {
      throw new NotFoundException(`Model with id ${id} not found`);
    }

    return model;
  }

  private mapToResponseDto(model: Model): ModelResDto {
    return {
      id: model.id,
      name: model.name,
      shortName: model.shortName,
      value: model.value,
      link: model.link,
      guestAccess: model.guestAccess,
      price: {
        input: Number(model.priceInput),
        output: Number(model.priceOutput),
      },
      metadata: {
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutputTokens,
        knowledgeCutoff: model.knowledgeCutoff,
      },
      developer: {
        id: model.developer.id,
        name: model.developer.name,
        link: model.developer.link,
        imageUrl: model.developer.imageUrl,
      },
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
