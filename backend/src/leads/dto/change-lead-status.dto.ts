import { IsIn } from 'class-validator';
import { LEAD_STATUSES, LeadStatus } from '../lead-status';

export class ChangeLeadStatusDto {
  @IsIn(LEAD_STATUSES)
  status: LeadStatus;
}
