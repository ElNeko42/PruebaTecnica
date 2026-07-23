<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('admin@demo.com');
const password = ref('demo1234');
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function onSubmit() {
  try {
    await auth.login(email.value, password.value);
    const redirect = (route.query.redirect as string) || '/leads';
    router.push(redirect);
  } catch {
    // error shown via store
  }
}
</script>

<template>
  <div class="login-page">
    <form class="card login-card" @submit.prevent="onSubmit">
      <div class="brand">
        <span>LF</span>
        <h1>LeadFlow</h1>
      </div>
      <p class="muted">Sign in to the mini CRM technical interview base.</p>

      <label class="label" for="email">Email</label>
      <input id="email" v-model="email" class="input" type="email" required />

      <label class="label" for="password">Password</label>
      <input
        id="password"
        v-model="password"
        class="input"
        type="password"
        required
      />

      <p v-if="auth.error" class="error">{{ auth.error }}</p>

      <button class="btn" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Signing in…' : 'Sign in' }}
      </button>

      <p class="hint muted">Demo: admin@demo.com / demo1234</p>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.login-card {
  width: min(420px, 100%);
  padding: 1.75rem;
  display: grid;
  gap: 0.75rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand span {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: white;
  font-weight: 700;
}

.brand h1 {
  margin: 0;
  font-size: 1.6rem;
}

.hint {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
}
</style>
