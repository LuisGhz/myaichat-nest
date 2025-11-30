import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from './chat.entity';

export enum MessageRole {
  SYSTEM = 'system',
  ASSISTANT = 'assistant',
  USER = 'user',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  chat: Chat;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar' })
  role: MessageRole;

  @Column({ type: 'int', nullable: true })
  inputTokens?: number;

  @Column({ type: 'int', nullable: true })
  outputTokens?: number;

  @CreateDateColumn()
  createdAt: Date;
}
