import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ContactsService } from '../contacts/contacts.service';
import { Lead } from './lead.entity';
import { LeadsService } from './leads.service';

type RepoMock = Pick<Repository<Lead>, 'findOne' | 'save'>;

function makeService(lead: Partial<Lead> | null) {
  const repo: jest.Mocked<RepoMock> = {
    findOne: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<RepoMock>;

  // findOne is called first to load the lead, then again to return relations.
  repo.findOne
    .mockResolvedValueOnce(lead as Lead)
    .mockResolvedValueOnce({ ...(lead as Lead), status: 'contacted' } as Lead);
  repo.save.mockImplementation(async (l) => l as Lead);

  const contacts = { findOne: jest.fn() } as unknown as ContactsService;
  const service = new LeadsService(repo as unknown as Repository<Lead>, contacts);
  return { service, repo };
}

describe('LeadsService.changeStatus', () => {
  it('persists an allowed transition', async () => {
    const { service, repo } = makeService({ id: 1, status: 'new' });

    await service.changeStatus(1, 'contacted');

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, status: 'contacted' }),
    );
  });

  it('rejects a forbidden transition and does not save', async () => {
    const { service, repo } = makeService({ id: 1, status: 'new' });

    await expect(service.changeStatus(1, 'qualified')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('rejects transitions out of the terminal lost state', async () => {
    const { service, repo } = makeService({ id: 1, status: 'lost' });

    await expect(service.changeStatus(1, 'new')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('rejects an unknown target status', async () => {
    const { service } = makeService({ id: 1, status: 'new' });

    await expect(service.changeStatus(1, 'archived')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a no-op transition to the same status', async () => {
    const { service } = makeService({ id: 1, status: 'contacted' });

    await expect(service.changeStatus(1, 'contacted')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws NotFound when the lead does not exist', async () => {
    const { service } = makeService(null);

    await expect(service.changeStatus(999, 'contacted')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
