import { canTransition, isLeadStatus, LEAD_STATUSES } from './lead-status';

describe('lead-status state machine', () => {
  it('recognises only known statuses', () => {
    for (const s of LEAD_STATUSES) {
      expect(isLeadStatus(s)).toBe(true);
    }
    expect(isLeadStatus('archived')).toBe(false);
    expect(isLeadStatus('')).toBe(false);
  });

  it('allows the forward pipeline and lost-from-active transitions', () => {
    expect(canTransition('new', 'contacted')).toBe(true);
    expect(canTransition('contacted', 'qualified')).toBe(true);
    expect(canTransition('new', 'lost')).toBe(true);
    expect(canTransition('contacted', 'lost')).toBe(true);
    expect(canTransition('qualified', 'lost')).toBe(true);
  });

  it('rejects skipping stages and going backwards', () => {
    expect(canTransition('new', 'qualified')).toBe(false);
    expect(canTransition('qualified', 'contacted')).toBe(false);
    expect(canTransition('contacted', 'new')).toBe(false);
  });

  it('treats lost as terminal', () => {
    expect(canTransition('lost', 'new')).toBe(false);
    expect(canTransition('lost', 'contacted')).toBe(false);
    expect(canTransition('lost', 'qualified')).toBe(false);
  });

  it('never allows a no-op self transition', () => {
    for (const s of LEAD_STATUSES) {
      expect(canTransition(s, s)).toBe(false);
    }
  });
});
