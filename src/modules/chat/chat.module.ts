import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat, Message } from './entities';
import {
  AIProviderRegistry,
  ChatService,
  ChatStreamService,
  OpenAIService,
  TranscriptionService,
} from './services';
import { ChatController } from './chat.controller';
import { ModelsModule } from '@mdl/models.module';
import { AI_PROVIDERS } from './interfaces';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message]), ModelsModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatStreamService,
    TranscriptionService,
    AIProviderRegistry,
    OpenAIService,
    {
      provide: AI_PROVIDERS,
      useFactory: (openai: OpenAIService) => [openai],
      inject: [OpenAIService],
    },
  ],
  exports: [ChatService, ChatStreamService],
})
export class ChatModule {}