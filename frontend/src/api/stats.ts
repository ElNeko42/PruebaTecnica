import http from './http';
import type { StatsSummary } from '../types';

export async function fetchStatsSummary() {
  const { data } = await http.get<StatsSummary>('/stats/summary');
  return data;
}
