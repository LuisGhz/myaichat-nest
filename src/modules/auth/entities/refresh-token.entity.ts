import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ unique: true })
  token: string;

  @Column()
  exp: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column()
  agentInfo: string;

  @CreateDateColumn()
  createdAt: Date;
}
