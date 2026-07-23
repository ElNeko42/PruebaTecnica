import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contact } from '../contacts/contact.entity';
import { User } from '../users/user.entity';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | string;

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column()
  title: string;

  @Column({ type: 'varchar', length: 50, default: 'new' })
  status: LeadStatus;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ name: 'contact_id', type: 'int', unsigned: true })
  contactId: number;

  @Column({ name: 'owner_id', type: 'int', unsigned: true })
  ownerId: number;

  @ManyToOne(() => Contact, (contact) => contact.leads)
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => User, (user) => user.leads)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
