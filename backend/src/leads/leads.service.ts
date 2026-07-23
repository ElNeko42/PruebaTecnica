import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactsService } from '../contacts/contacts.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepo: Repository<Lead>,
    private readonly contactsService: ContactsService,
  ) {}

  async findAll(page = 1, pageSize = 10, status?: string) {
    const take = Math.min(Math.max(pageSize, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const qb = this.leadsRepo
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.contact', 'contact')
      .leftJoinAndSelect('lead.owner', 'owner')
      .orderBy('lead.createdAt', 'DESC');

    if (status) {
      qb.andWhere('lead.status = :status', { status });
    }

    qb.skip(skip).take(take);

    const [data] = await qb.getManyAndCount();
    const totalCount = data.length;

    return {
      data,
      totalCount,
      page: Math.max(page, 1),
      pageSize: take,
    };
  }

  async findOne(id: number) {
    const lead = await this.leadsRepo.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException(`Lead ${id} not found`);
    }
    return lead;
  }

  async create(dto: CreateLeadDto, ownerId: number) {
    await this.contactsService.findOne(dto.contactId);
    const lead = this.leadsRepo.create({
      title: dto.title,
      status: dto.status || 'new',
      score: dto.score ?? 0,
      contactId: dto.contactId,
      ownerId,
    });
    const saved = await this.leadsRepo.save(lead);
    return this.leadsRepo.findOne({
      where: { id: saved.id },
      relations: ['contact', 'owner'],
    });
  }

  async update(id: number, dto: UpdateLeadDto) {
    const lead = await this.findOne(id);
    if (dto.contactId) {
      await this.contactsService.findOne(dto.contactId);
    }
    Object.assign(lead, dto);
    return this.leadsRepo.save(lead);
  }

  async remove(id: number) {
    const lead = await this.findOne(id);
    await this.leadsRepo.remove(lead);
    return { deleted: true };
  }
}
