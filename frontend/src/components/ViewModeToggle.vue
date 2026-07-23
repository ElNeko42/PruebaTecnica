<script setup lang="ts">
type Option = { value: string; label: string };

defineProps<{
  modelValue: string;
  options: Option[];
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="toggle" role="tablist">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="toggle-btn"
      :class="{ active: opt.value === modelValue }"
      type="button"
      role="tab"
      :aria-selected="opt.value === modelValue"
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  padding: 0.2rem;
  gap: 0.2rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
}

.toggle-btn {
  border: none;
  background: transparent;
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.88rem;
  color: var(--muted);
  cursor: pointer;
}

.toggle-btn.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}
</style>
