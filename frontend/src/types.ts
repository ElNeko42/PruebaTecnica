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

export type PaginatedContacts = {
  data: Contact[];
  total: number;
  page: number;
  pageSize: number;
};

export type PaginatedLeads = {
  data: Lead[];
  totalCount: number;
  page: number;
  pageSize: number;
};
