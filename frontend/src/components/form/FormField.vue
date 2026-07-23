<script setup lang="ts">
defineProps<{
  label: string;
  htmlFor: string;
  error?: string;
}>();
</script>

<template>
  <div class="field">
    <label class="label" :for="htmlFor">{{ label }}</label>
    <slot :invalid="Boolean(error)" />
    <p v-if="error" class="field-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 0.35rem;
}

.field-error {
  margin: 0;
  color: var(--danger);
  font-size: 0.82rem;
}
</style>
