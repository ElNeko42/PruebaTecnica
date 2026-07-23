import { onBeforeUnmount } from 'vue';

/** Devuelve una versión con debounce de `fn` que se cancela al desmontar. */
export function useDebounceFn<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 300,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function debounced(...args: A) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer);
  });

  return debounced;
}
