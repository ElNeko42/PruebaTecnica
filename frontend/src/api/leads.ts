import http from './http';
import type { Lead, PaginatedLeads } from '../types';

export async function fetchLeads(params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const { data } = await http.get<PaginatedLeads>('/leads', { params });
  return data;
}

export async function fetchLead(id: number) {
  const { data } = await http.get<Lead>(`/leads/${id}`);
  return data;
}

export async function createLead(payload: {
  title: string;
  status?: string;
  score?: number;
  contactId: number;
}) {
  const { data } = await http.post<Lead>('/leads', payload);
  return data;
}

export async function updateLead(
  id: number,
  payload: {
    title?: string;
    status?: string;
    score?: number;
    contactId?: number;
  },
) {
  const { data } = await http.patch<Lead>(`/leads/${id}`, payload);
  return data;
}

export async function deleteLead(id: number) {
  await http.delete(`/leads/${id}`);
}
