import { reactive } from 'vue';

export type ToastKind = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

const toasts = reactive<Toast[]>([]);
let seq = 0;

function push(message: string, kind: ToastKind, timeout = 4000) {
  const id = ++seq;
  toasts.push({ id, kind, message });
  if (timeout > 0) {
    setTimeout(() => dismiss(id), timeout);
  }
}

function dismiss(id: number) {
  const i = toasts.findIndex((t) => t.id === id);
  if (i !== -1) toasts.splice(i, 1);
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (msg: string) => push(msg, 'success'),
    error: (msg: string) => push(msg, 'error'),
    info: (msg: string) => push(msg, 'info'),
  };
}
