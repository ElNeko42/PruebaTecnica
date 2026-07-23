<script setup lang="ts" generic="T extends string | number | null">
import { computed, nextTick, ref, watch } from 'vue';

type Option = { label: string; value: T };

const props = defineProps<{
  modelValue: T;
  options: Option[];
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: T];
}>();

const open = ref(false);
const query = ref('');
const activeIndex = ref(-1);
const rootEl = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);

const selectedOption = computed(() =>
  props.options.find((o) => o.value === props.modelValue),
);

// While open we show what the user is typing; while closed, the selected label.
const displayValue = computed(() =>
  open.value ? query.value : (selectedOption.value?.label ?? ''),
);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

watch(filtered, () => {
  // Keep the highlight in range whenever the filtered list changes.
  activeIndex.value = filtered.value.length ? 0 : -1;
});

function openMenu() {
  if (props.disabled) return;
  open.value = true;
  query.value = '';
  const current = filtered.value.findIndex((o) => o.value === props.modelValue);
  activeIndex.value = current >= 0 ? current : filtered.value.length ? 0 : -1;
}

function closeMenu() {
  open.value = false;
  query.value = '';
}

function select(option: Option) {
  emit('update:modelValue', option.value);
  closeMenu();
  inputEl.value?.blur();
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value;
  open.value = true;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (!open.value) openMenu();
    else activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1);
    scrollActiveIntoView();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
    scrollActiveIntoView();
  } else if (event.key === 'Enter') {
    if (open.value && activeIndex.value >= 0) {
      event.preventDefault();
      select(filtered.value[activeIndex.value]);
    }
  } else if (event.key === 'Escape') {
    if (open.value) {
      event.preventDefault();
      closeMenu();
    }
  }
}

const listEl = ref<HTMLElement | null>(null);
function scrollActiveIntoView() {
  nextTick(() => {
    const el = listEl.value?.children[activeIndex.value] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  });
}

function onDocumentPointer(event: PointerEvent) {
  if (open.value && rootEl.value && !rootEl.value.contains(event.target as Node)) {
    closeMenu();
  }
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('pointerdown', onDocumentPointer);
  else document.removeEventListener('pointerdown', onDocumentPointer);
});
</script>

<template>
  <div ref="rootEl" class="combo" :class="{ open }">
    <input
      ref="inputEl"
      class="input"
      :class="{ invalid }"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="open"
      :disabled="disabled"
      :value="displayValue"
      :placeholder="placeholder"
      @focus="openMenu"
      @input="onInput"
      @keydown="onKeydown"
    />
    <span class="caret" aria-hidden="true">▾</span>

    <ul v-if="open" ref="listEl" class="menu card" role="listbox">
      <li
        v-for="(option, i) in filtered"
        :key="String(option.value)"
        class="option"
        :class="{ active: i === activeIndex, selected: option.value === modelValue }"
        role="option"
        :aria-selected="option.value === modelValue"
        @pointerdown.prevent="select(option)"
        @pointermove="activeIndex = i"
      >
        {{ option.label }}
      </li>
      <li v-if="!filtered.length" class="option empty">No matches</li>
    </ul>
  </div>
</template>

<style scoped>
.combo {
  position: relative;
}

.input {
  width: 100%;
  padding-right: 2rem;
}

.input.invalid {
  border-color: var(--danger);
  background: #fef6f5;
}

.caret {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
  font-size: 0.75rem;
}

.menu {
  position: absolute;
  z-index: 50;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.3rem;
  list-style: none;
  max-height: 240px;
  overflow-y: auto;
}

.option {
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.92rem;
}

.option.active {
  background: var(--accent-soft);
}

.option.selected {
  color: var(--accent);
  font-weight: 600;
}

.option.empty {
  color: var(--muted);
  cursor: default;
}
</style>
