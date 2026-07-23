<script setup lang="ts" generic="T">
import { computed, ref, useSlots, watchEffect } from 'vue';

type Column = {
  key: string;
  label: string;
  numeric?: boolean;
};

type RowKey = string | number;

const props = defineProps<{
  columns: Column[];
  rows: T[];
  rowKey?: string;
  selectable?: boolean;
  selected?: RowKey[];
  loading?: boolean;
  error?: string | null;
  emptyText?: string;
}>();

const emit = defineEmits<{
  'update:selected': [value: RowKey[]];
}>();

const slots = useSlots();
const hasActions = computed(() => Boolean(slots.actions));

const keyField = computed(() => props.rowKey ?? 'id');

function keyOf(row: T): RowKey {
  return (row as Record<string, unknown>)[keyField.value] as RowKey;
}

function cellValue(row: T, key: string): string {
  const value = (row as Record<string, unknown>)[key];
  return value == null ? '' : String(value);
}

const selectedSet = computed(() => new Set(props.selected ?? []));

const allSelected = computed(
  () =>
    props.rows.length > 0 &&
    props.rows.every((r) => selectedSet.value.has(keyOf(r))),
);
const someSelected = computed(
  () => props.rows.some((r) => selectedSet.value.has(keyOf(r))) && !allSelected.value,
);

// `indeterminate` is a DOM property, not an attribute — set it imperatively.
const headerCheck = ref<HTMLInputElement | null>(null);
watchEffect(() => {
  if (headerCheck.value) headerCheck.value.indeterminate = someSelected.value;
});

function toggleRow(row: T) {
  const key = keyOf(row);
  const next = new Set(selectedSet.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  emit('update:selected', [...next]);
}

function toggleAll() {
  emit('update:selected', allSelected.value ? [] : props.rows.map(keyOf));
}
</script>

<template>
  <div class="card table-wrap">
    <p v-if="loading" class="empty">Loading…</p>
    <p v-else-if="error" class="empty error">{{ error }}</p>
    <p v-else-if="!rows.length" class="empty">{{ emptyText ?? 'No results.' }}</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th v-if="selectable" class="check-col">
            <input
              ref="headerCheck"
              type="checkbox"
              :checked="allSelected"
              aria-label="Select all rows"
              @change="toggleAll"
            />
          </th>
          <th v-for="col in columns" :key="col.key" :class="{ num: col.numeric }">
            {{ col.label }}
          </th>
          <th v-if="hasActions" class="actions-col"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="keyOf(row)"
          :class="{ 'row-selected': selectedSet.has(keyOf(row)) }"
        >
          <td v-if="selectable" class="check-col">
            <input
              type="checkbox"
              :checked="selectedSet.has(keyOf(row))"
              aria-label="Select row"
              @change="toggleRow(row)"
            />
          </td>
          <td v-for="col in columns" :key="col.key" :class="{ num: col.numeric }">
            <slot :name="col.key" :row="row">{{ cellValue(row, col.key) }}</slot>
          </td>
          <td v-if="hasActions" class="actions-col">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

.check-col {
  width: 1%;
  white-space: nowrap;
  text-align: center;
}

.check-col input {
  cursor: pointer;
}

.actions-col {
  text-align: right;
  white-space: nowrap;
}

.num {
  text-align: right;
  white-space: nowrap;
}

tr.row-selected td {
  background: var(--accent-soft);
}
</style>
