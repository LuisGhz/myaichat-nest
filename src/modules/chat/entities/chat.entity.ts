import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities';
import { Message } from './message.entity';
import { Prompt } from '@prompts/entities';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Prompt, (prompt) => prompt.chats, { nullable: true, onDelete: 'RESTRICT' })
  prompt?: Prompt;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @Column({ type: 'int', default: 4096 })
  maxTokens: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 1.0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  temperature: number;

  @Column({ type: 'varchar' })
  model: string;

  @Column({ type: 'boolean', default: false })
  isImageGeneration: boolean;

  @Column({ type: 'boolean', default: false })
  isWebSearch: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
