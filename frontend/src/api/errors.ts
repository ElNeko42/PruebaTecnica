import { AxiosError } from 'axios';

type ApiError = { message?: string | string[]; error?: string };

/** Convierte cualquier error lanzado en un mensaje legible para un toast. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiError | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
    if (data?.error) return data.error;
  }
  return fallback;
}
