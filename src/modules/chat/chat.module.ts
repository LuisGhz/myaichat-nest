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
import { PromptsModule } from '@prompts/prompts.module';
import { AI_PROVIDERS } from './interfaces';
import { GuestModelAccessGuard } from '@cmn/guards';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message]), ModelsModule, PromptsModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatStreamService,
    TranscriptionService,
    AIProviderRegistry,
    OpenAIService,
    GuestModelAccessGuard,
    {
      provide: AI_PROVIDERS,
      useFactory: (openai: OpenAIService) => [openai],
      inject: [OpenAIService],
    },
  ],
  exports: [ChatService, ChatStreamService],
})
export class ChatModule {}