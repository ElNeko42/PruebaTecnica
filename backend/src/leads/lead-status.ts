export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'lost'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Transiciones de estado permitidas para un lead.
 *
 * Pipeline: new → contacted → qualified. Un lead puede marcarse como `lost`
 * desde cualquier estado activo. `lost` es terminal (no se reabre).
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
