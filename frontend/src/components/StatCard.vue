<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  hint?: string;
}>();
</script>

<template>
  <div class="stat card">
    <p class="stat-label">{{ label }}</p>
    <p class="stat-value">{{ value }}</p>
    <p v-if="hint" class="stat-hint muted">{{ hint }}</p>
  </div>
</template>

<style scoped>
.stat {
  padding: 1.1rem 1.2rem;
  display: grid;
  gap: 0.2rem;
}

.stat-label {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
}

.stat-value {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1.1;
}

.stat-hint {
  margin: 0;
  font-size: 0.8rem;
}
</style>
