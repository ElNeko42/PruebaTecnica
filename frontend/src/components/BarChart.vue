<script setup lang="ts">
import { computed } from 'vue';

type Bar = {
  label: string;
  value: number;
  color?: string;
  display?: string;
};

const props = defineProps<{
  items: Bar[];
}>();

const max = computed(() => Math.max(...props.items.map((i) => i.value), 1));

function widthOf(value: number) {
  return `${(value / max.value) * 100}%`;
}
</script>

<template>
  <ul class="bars">
    <li v-for="bar in items" :key="bar.label" class="bar-row">
      <span class="bar-label">{{ bar.label }}</span>
      <span class="bar-track">
        <span
          class="bar-fill"
          :style="{ width: widthOf(bar.value), background: bar.color || 'var(--accent)' }"
        />
      </span>
      <span class="bar-value">{{ bar.display ?? bar.value }}</span>
    </li>
  </ul>
</template>

<style scoped>
.bars {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.7rem;
}

.bar-row {
  display: grid;
  grid-template-columns: 96px 1fr auto;
  align-items: center;
  gap: 0.75rem;
}

.bar-label {
  font-size: 0.85rem;
  color: var(--muted);
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  height: 12px;
  background: var(--bg);
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  min-width: 2px;
  transition: width 0.3s ease;
}

.bar-value {
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
