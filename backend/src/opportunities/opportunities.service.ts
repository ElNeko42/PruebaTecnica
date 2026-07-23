import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactsService } from '../contacts/contacts.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { Opportunity } from './opportunity.entity';

export type OpportunityFilters = {
  stage?: string;
  q?: string;
  contactId?: number;
  amountMin?: number;
  amountMax?: number;
};

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunitiesRepo: Repository<Opportunity>,
    private readonly contactsService: ContactsService,
  ) {}

  async findAll(page = 1, pageSize = 10, filters: OpportunityFilters = {}) {
    const take = Math.min(Math.max(pageSize, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const qb = this.opportunitiesRepo
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.contact', 'contact')
      .leftJoinAndSelect('opportunity.owner', 'owner')
      .orderBy('opportunity.createdAt', 'DESC');

    if (filters.stage) {
      qb.andWhere('opportunity.stage = :stage', { stage: filters.stage });
    }
    if (filters.q) {
      qb.andWhere('opportunity.title LIKE :q', { q: `%${filters.q}%` });
    }
    if (filters.contactId) {
      qb.andWhere('opportunity.contactId = :contactId', {
        contactId: filters.contactId,
      });
    }
    if (filters.amountMin != null) {
      qb.andWhere('opportunity.amount >= :amountMin', {
        amountMin: filters.amountMin,
      });
    }
    if (filters.amountMax != null) {
      qb.andWhere('opportunity.amount <= :amountMax', {
        amountMax: filters.amountMax,
      });
    }

    qb.skip(skip).take(take);

    const [data, totalCount] = await qb.getManyAndCount();

    return { data, totalCount, page: Math.max(page, 1), pageSize: take };
  }

  async findOne(id: number) {
    const opportunity = await this.opportunitiesRepo.findOne({
      where: { id },
      relations: ['contact', 'owner'],
    });
    if (!opportunity) {
      throw new NotFoundException(`Opportunity ${id} not found`);
    }
    return opportunity;
  }

  async create(dto: CreateOpportunityDto, ownerId: number) {
    await this.contactsService.findOne(dto.contactId);
    const opportunity = this.opportunitiesRepo.create({
      title: dto.title,
      amount: dto.amount,
      stage: dto.stage || 'prospecting',
      contactId: dto.contactId,
      ownerId,
    });
    const saved = await this.opportunitiesRepo.save(opportunity);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateOpportunityDto) {
    const opportunity = await this.findOne(id);
    if (dto.contactId) {
      await this.contactsService.findOne(dto.contactId);
    }
    Object.assign(opportunity, dto);
    await this.opportunitiesRepo.save(opportunity);
    return this.findOne(id);
  }

  async remove(id: number) {
    const opportunity = await this.findOne(id);
    await this.opportunitiesRepo.remove(opportunity);
    return { deleted: true };
  }
}
