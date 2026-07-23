<script setup lang="ts" generic="T">
import { computed, ref } from 'vue';

type Column = {
  key: string;
  label: string;
};

const props = defineProps<{
  columns: Column[];
  items: T[];
  groupKey: string;
  itemKey?: string;
  draggable?: boolean;
  // Regla que aporta el padre para decidir si `item` puede soltarse en una columna.
  canDrop?: (item: T, toKey: string) => boolean;
}>();

const emit = defineEmits<{
  move: [item: T, toKey: string];
}>();

const keyField = computed(() => props.itemKey ?? 'id');

const grouped = computed(() => {
  const map = new Map<string, T[]>();
  for (const col of props.columns) map.set(col.key, []);
  for (const item of props.items) {
    const group = String((item as Record<string, unknown>)[props.groupKey]);
    // Los elementos cuyo grupo no es una columna conocida simplemente no se muestran.
    map.get(group)?.push(item);
  }
  return map;
});

function itemId(item: T): string | number {
  return (item as Record<string, unknown>)[keyField.value] as string | number;
}

// --- Arrastrar y soltar ---
const dragging = ref<T | null>(null);
const dragOverKey = ref<string | null>(null);
const draggingId = computed(() =>
  dragging.value ? itemId(dragging.value as T) : null,
);

function allowsDrop(toKey: string): boolean {
  if (!dragging.value) return false;
  return props.canDrop ? props.canDrop(dragging.value, toKey) : true;
}

function onDragStart(item: T, event: DragEvent) {
  dragging.value = item;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(itemId(item)));
  }
}

function onDragEnd() {
  dragging.value = null;
  dragOverKey.value = null;
}

function onDragOver(toKey: string, event: DragEvent) {
  // Solo se acepta soltar (preventDefault) en columnas con una transición válida.
  if (allowsDrop(toKey)) {
    event.preventDefault();
    dragOverKey.value = toKey;
  }
}

function onDragLeave(toKey: string) {
  if (dragOverKey.value === toKey) dragOverKey.value = null;
}

function onDrop(toKey: string) {
  const item = dragging.value;
  if (item && allowsDrop(toKey)) emit('move', item, toKey);
  onDragEnd();
}
</script>

<template>
  <div class="board">
    <section
      v-for="col in columns"
      :key="col.key"
      class="column"
      :class="{ 'drop-target': dragOverKey === col.key }"
    >
      <header class="column-head">
        <slot name="column-header" :column="col" :count="grouped.get(col.key)?.length ?? 0">
          <span class="column-title">{{ col.label }}</span>
          <span class="column-count">{{ grouped.get(col.key)?.length ?? 0 }}</span>
        </slot>
      </header>

      <div
        class="column-body"
        @dragover="onDragOver(col.key, $event)"
        @dragleave="onDragLeave(col.key)"
        @drop="onDrop(col.key)"
      >
        <div
          v-for="item in grouped.get(col.key)"
          :key="itemId(item)"
          class="card-wrap"
          :class="{ dragging: draggingId === itemId(item) }"
          :draggable="draggable"
          @dragstart="onDragStart(item, $event)"
          @dragend="onDragEnd"
        >
          <slot name="card" :item="item" :column="col" />
        </div>
        <p v-if="!grouped.get(col.key)?.length" class="column-empty">Empty</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 1fr);
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  align-items: start;
}

.column {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  min-height: 120px;
  transition: border-color 0.15s, background 0.15s;
}

.column.drop-target {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.85rem 0.9rem;
  border-bottom: 1px solid var(--line);
}

.column-title {
  font-weight: 600;
  text-transform: capitalize;
}

.column-count {
  min-width: 1.5rem;
  text-align: center;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
}

.column-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.75rem;
  flex: 1;
}

.card-wrap[draggable='true'] {
  cursor: grab;
}

.card-wrap.dragging {
  opacity: 0.5;
}

.column-empty {
  margin: 0;
  padding: 1rem 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.85rem;
}
</style>
