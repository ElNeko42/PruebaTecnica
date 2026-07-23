import http from './http';
import type { Contact, PaginatedContacts } from '../types';

export async function fetchContacts(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  company?: string;
}) {
  const { data } = await http.get<PaginatedContacts>('/contacts', { params });
  return data;
}

export async function fetchContact(id: number) {
  const { data } = await http.get<Contact>(`/contacts/${id}`);
  return data;
}

export async function createContact(payload: Partial<Contact>) {
  const { data } = await http.post<Contact>('/contacts', payload);
  return data;
}
