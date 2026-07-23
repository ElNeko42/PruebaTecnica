export type Contact = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: number;
  title: string;
  status: string;
  score: number;
  contactId: number;
  ownerId: number;
  contact?: Contact | null;
  owner?: { id: number; email: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type OpportunityStage =
  | 'prospecting'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export type Opportunity = {
  id: number;
  title: string;
  amount: number;
  stage: OpportunityStage;
  contactId: number;
  ownerId: number;
  contact?: Contact | null;
  owner?: { id: number; email: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedContacts = {
  data: Contact[];
  total: number;
  page: number;
  pageSize: number;
};

export type PaginatedOpportunities = {
  data: Opportunity[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type StageBucket = { count: number; amount: number };

export type StatsSummary = {
  leads: {
    total: number;
    byStatus: Record<string, number>;
  };
  opportunities: {
    total: number;
    totalAmount: number;
    byStage: Record<string, StageBucket>;
    open: StageBucket;
    won: StageBucket;
    lost: StageBucket;
  };
};

export type PaginatedLeads = {
  data: Lead[];
  totalCount: number;
  page: number;
  pageSize: number;
};
