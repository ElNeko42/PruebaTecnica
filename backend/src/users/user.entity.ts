import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lead } from '../leads/lead.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Lead, (lead) => lead.owner)
  leads: Lead[];
}
