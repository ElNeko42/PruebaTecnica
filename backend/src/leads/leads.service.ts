import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactsService } from '../contacts/contacts.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './lead.entity';
import { canTransition, isLeadStatus, LeadStatus } from './lead-status';

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

    const [data, totalCount] = await qb.getManyAndCount();

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
    // Un cambio de estado por el update genérico también debe cumplir las reglas.
    if (dto.status && dto.status !== lead.status) {
      this.assertValidTransition(lead.status as LeadStatus, dto.status);
    }
    Object.assign(lead, dto);
    return this.leadsRepo.save(lead);
  }

  async changeStatus(id: number, status: string) {
    const lead = await this.findOne(id);
    this.assertValidTransition(lead.status as LeadStatus, status);
    lead.status = status as LeadStatus;
    await this.leadsRepo.save(lead);
    return this.leadsRepo.findOne({
      where: { id },
      relations: ['contact', 'owner'],
    });
  }

  private assertValidTransition(from: LeadStatus, to: string) {
    if (!isLeadStatus(to)) {
      throw new BadRequestException(`Unknown lead status '${to}'`);
    }
    if (from === to) {
      throw new BadRequestException(`Lead is already '${to}'`);
    }
    if (!canTransition(from, to)) {
      throw new BadRequestException(
        `Invalid transition: a lead cannot move from '${from}' to '${to}'`,
      );
    }
  }

  async remove(id: number) {
    const lead = await this.findOne(id);
    await this.leadsRepo.remove(lead);
    return { deleted: true };
  }
}
