import http from './http';
import type {
  Opportunity,
  OpportunityStage,
  PaginatedOpportunities,
} from '../types';

export async function fetchOpportunities(params: {
  page?: number;
  pageSize?: number;
  stage?: string;
}) {
  const { data } = await http.get<PaginatedOpportunities>('/opportunities', {
    params,
  });
  return data;
}

export async function fetchOpportunity(id: number) {
  const { data } = await http.get<Opportunity>(`/opportunities/${id}`);
  return data;
}

export type OpportunityPayload = {
  title: string;
  amount: number;
  stage?: OpportunityStage;
  contactId: number;
};

export async function createOpportunity(payload: OpportunityPayload) {
  const { data } = await http.post<Opportunity>('/opportunities', payload);
  return data;
}

export async function updateOpportunity(
  id: number,
  payload: Partial<OpportunityPayload>,
) {
  const { data } = await http.patch<Opportunity>(
    `/opportunities/${id}`,
    payload,
  );
  return data;
}

export async function deleteOpportunity(id: number) {
  await http.delete(`/opportunities/${id}`);
}
