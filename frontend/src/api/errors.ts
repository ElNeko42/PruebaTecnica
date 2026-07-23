import { AxiosError } from 'axios';

type ApiError = { message?: string | string[]; error?: string };

/** Turns any thrown value into a human-readable message for a toast. */
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
