import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lead } from '../leads/lead.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Lead, (lead) => lead.contact)
  leads: Lead[];
}
