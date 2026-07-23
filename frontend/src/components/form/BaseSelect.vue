<script setup lang="ts" generic="T extends string | number | null">
type Option = { label: string; value: T };

const props = defineProps<{
  modelValue: T;
  options: Option[];
  invalid?: boolean;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: T];
}>();

// Los valores de un <select> nativo siempre son strings; buscamos la opción
// original para que el valor emitido conserve su tipo (p. ej. un id numérico de contacto).
function onChange(event: Event) {
  const raw = (event.target as HTMLSelectElement).value;
  const option = props.options.find((o) => String(o.value) === raw);
  if (option) emit('update:modelValue', option.value);
}
</script>

<template>
  <select
    class="select"
    :class="{ invalid }"
    :value="String(modelValue ?? '')"
    @change="onChange"
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option v-for="o in options" :key="String(o.value)" :value="String(o.value)">
      {{ o.label }}
    </option>
  </select>
</template>

<style scoped>
.select.invalid {
  border-color: var(--danger);
  background: #fef6f5;
}
</style>
