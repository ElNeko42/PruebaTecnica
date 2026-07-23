import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactsRepo: Repository<Contact>,
  ) {}

  async findAll(page = 1, pageSize = 10, q?: string, company?: string) {
    const take = Math.min(Math.max(pageSize, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const qb = this.contactsRepo.createQueryBuilder('contact');

    if (q) {
      qb.andWhere('contact.name LIKE :q', { q: `%${q}%` });
    }
    if (company) {
      qb.andWhere('contact.company = :company', { company });
    }

    qb.orderBy('contact.createdAt', 'DESC').skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: Math.max(page, 1), pageSize: take };
  }

  async findOne(id: number) {
    const contact = await this.contactsRepo.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }
    return contact;
  }

  async create(dto: CreateContactDto) {
    const contact = this.contactsRepo.create(dto);
    return this.contactsRepo.save(contact);
  }

  async update(id: number, dto: UpdateContactDto) {
    const contact = await this.findOne(id);
    Object.assign(contact, dto);
    return this.contactsRepo.save(contact);
  }

  async remove(id: number) {
    const contact = await this.findOne(id);
    await this.contactsRepo.remove(contact);
    return { deleted: true };
  }
}
