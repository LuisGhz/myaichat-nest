import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat, Message } from './entities';
import { ChatService, OpenAIService } from './services';
import { ChatController } from './chat.controller';
import { ModelsModule } from '@mdl/models.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message]), ModelsModule],
  controllers: [ChatController],
  providers: [ChatService, OpenAIService],
  exports: [ChatService],
})
export class ChatModule {}