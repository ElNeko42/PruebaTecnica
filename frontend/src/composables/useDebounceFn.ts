import { onBeforeUnmount } from 'vue';

/** Returns a debounced wrapper of `fn` that cancels itself on unmount. */
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
