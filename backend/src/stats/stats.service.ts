import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { LEAD_STATUSES, LeadStatus } from '../leads/lead-status';
import { Opportunity } from '../opportunities/opportunity.entity';
import {
  OPPORTUNITY_STAGES,
  OpportunityStage,
} from '../opportunities/opportunity.entity';

const CLOSED_STAGES: OpportunityStage[] = ['won', 'lost'];

type StageBucket = { count: number; amount: number };

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepo: Repository<Lead>,
    @InjectRepository(Opportunity)
    private readonly opportunitiesRepo: Repository<Opportunity>,
  ) {}

  async summary() {
    const [leadsByStatus, oppsByStage] = await Promise.all([
      this.leadsByStatus(),
      this.opportunitiesByStage(),
    ]);

    const leadsTotal = Object.values(leadsByStatus).reduce((a, b) => a + b, 0);

    const stages = Object.values(oppsByStage);
    const open = this.sumBuckets(
      OPPORTUNITY_STAGES.filter((s) => !CLOSED_STAGES.includes(s)).map(
        (s) => oppsByStage[s],
      ),
    );

    return {
      leads: {
        total: leadsTotal,
        byStatus: leadsByStatus,
      },
      opportunities: {
        total: stages.reduce((a, b) => a + b.count, 0),
        totalAmount: stages.reduce((a, b) => a + b.amount, 0),
        byStage: oppsByStage,
        open,
        won: oppsByStage.won,
        lost: oppsByStage.lost,
      },
    };
  }

  private async leadsByStatus(): Promise<Record<LeadStatus, number>> {
    const rows = await this.leadsRepo
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .getRawMany<{ status: string; count: string }>();

    const result = Object.fromEntries(
      LEAD_STATUSES.map((s) => [s, 0]),
    ) as Record<LeadStatus, number>;
    for (const row of rows) {
      if (row.status in result) {
        result[row.status as LeadStatus] = Number(row.count);
      }
    }
    return result;
  }

  private async opportunitiesByStage(): Promise<
    Record<OpportunityStage, StageBucket>
  > {
    const rows = await this.opportunitiesRepo
      .createQueryBuilder('opportunity')
      .select('opportunity.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(opportunity.amount), 0)', 'amount')
      .groupBy('opportunity.stage')
      .getRawMany<{ stage: string; count: string; amount: string }>();

    const result = Object.fromEntries(
      OPPORTUNITY_STAGES.map((s) => [s, { count: 0, amount: 0 }]),
    ) as Record<OpportunityStage, StageBucket>;
    for (const row of rows) {
      if (row.stage in result) {
        result[row.stage as OpportunityStage] = {
          count: Number(row.count),
          amount: Number(row.amount),
        };
      }
    }
    return result;
  }

  private sumBuckets(buckets: StageBucket[]): StageBucket {
    return buckets.reduce(
      (acc, b) => ({ count: acc.count + b.count, amount: acc.amount + b.amount }),
      { count: 0, amount: 0 },
    );
  }
}
