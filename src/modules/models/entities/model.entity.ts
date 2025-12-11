import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ModelDeveloper } from './model-developer.entity';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  shortName: string;

  @Column({ unique: true })
  value: string;

  @Column()
  link: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  priceInput: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  priceOutput: number;

  @Column({ type: 'int' })
  contextWindow: number;

  @Column({ type: 'int' })
  maxOutputTokens: number;

  @Column()
  knowledgeCutoff: string;

  @Column({ type: 'boolean', default: false })
  guestAccess: boolean;

  @ManyToOne(() => ModelDeveloper, (developer) => developer.models, {
    onDelete: 'CASCADE',
  })
  developer: ModelDeveloper;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
