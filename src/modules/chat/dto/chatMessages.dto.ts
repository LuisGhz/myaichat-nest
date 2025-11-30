import { Message } from '../entities';

export class ChatMessagesResDto {
  chatId: string;
  title?: string;
  messages: Pick<Message, 'id' | 'content' | 'role' | 'createdAt'>[];
}
