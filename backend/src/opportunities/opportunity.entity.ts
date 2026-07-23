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

export const OPPORTUNITY_STAGES = [
  'prospecting',
  'proposal',
  'negotiation',
  'won',
  'lost',
] as const;

export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  amount: number;

  @Column({ type: 'varchar', length: 50, default: 'prospecting' })
  stage: OpportunityStage;

  @Column({ name: 'contact_id', type: 'int', unsigned: true })
  contactId: number;

  @Column({ name: 'owner_id', type: 'int', unsigned: true })
  ownerId: number;

  @ManyToOne(() => Contact)
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
