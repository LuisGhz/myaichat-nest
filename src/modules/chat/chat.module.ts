import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat, Message } from './entities';
import { ChatService, OpenAIService } from './services';
import { ChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message])],
  controllers: [ChatController],
  providers: [ChatService, OpenAIService],
  exports: [ChatService],
})
export class ChatModule {}