import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model, ModelDeveloper } from './entities';
import { ModelsService, ModelSeedService } from './services';
import { ModelsController } from './models.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Model, ModelDeveloper])],
  controllers: [ModelsController],
  providers: [ModelsService, ModelSeedService],
  exports: [ModelsService],
})
export class ModelsModule {}
