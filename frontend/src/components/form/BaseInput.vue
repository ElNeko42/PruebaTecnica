<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number | null;
  invalid?: boolean;
  type?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (props.type === 'number') {
    emit('update:modelValue', target.value === '' ? null : Number(target.value));
  } else {
    emit('update:modelValue', target.value);
  }
}
</script>

<template>
  <input
    class="input"
    :class="{ invalid }"
    :type="type ?? 'text'"
    :value="modelValue ?? ''"
    @input="onInput"
  />
</template>

<style scoped>
.input.invalid {
  border-color: var(--danger);
  background: #fef6f5;
}
</style>
