<script setup lang="ts">
import { useToast } from '../composables/useToast';

const { toasts, dismiss } = useToast();
</script>

<template>
  <div class="toast-host" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.kind"
        @click="dismiss(toast.id)"
      >
        <span class="dot" aria-hidden="true" />
        <span class="msg">{{ toast.message }}</span>
        <button class="close" type="button" aria-label="Dismiss">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 1rem;
  right: 1rem;
  left: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: min(380px, 100%);
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  cursor: pointer;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.toast.success {
  border-left: 4px solid var(--accent);
}
.toast.success .dot {
  background: var(--accent);
}

.toast.error {
  border-left: 4px solid var(--danger);
}
.toast.error .dot {
  background: var(--danger);
}

.toast.info {
  border-left: 4px solid var(--muted);
}
.toast.info .dot {
  background: var(--muted);
}

.msg {
  flex: 1;
  font-size: 0.9rem;
}

.close {
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.2rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
