export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'lost'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Allowed status transitions for a lead.
 *
 * Pipeline: new → contacted → qualified. A lead can be marked `lost` from any
 * active stage. `lost` is terminal (a lost lead is not reopened).
 */
export const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['lost'],
  lost: [],
};

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: LeadStatus, to: LeadStatus): boolean {
  return LEAD_TRANSITIONS[from].includes(to);
}
