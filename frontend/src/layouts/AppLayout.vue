<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">LF</span>
        <div>
          <strong>LeadFlow</strong>
          <p class="muted">Mini CRM</p>
        </div>
      </div>

      <nav>
        <RouterLink to="/leads">Leads</RouterLink>
        <RouterLink to="/contacts">Contacts</RouterLink>
        <RouterLink to="/opportunities">Opportunities</RouterLink>
      </nav>

      <div class="sidebar-footer">
        <p>{{ auth.user?.name }}</p>
        <button class="btn ghost" type="button" @click="logout">Log out</button>
      </div>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 1.1rem;
  border-right: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
}

.brand {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: white;
  font-weight: 700;
}

.brand p {
  margin: 0.1rem 0 0;
  font-size: 0.85rem;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

nav a {
  padding: 0.65rem 0.8rem;
  border-radius: 8px;
  color: var(--ink);
}

nav a.router-link-active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}

.sidebar-footer {
  margin-top: auto;
}

.sidebar-footer p {
  margin: 0 0 0.4rem;
  font-size: 0.9rem;
}

.content {
  padding: 1.75rem;
}

@media (max-width: 800px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid var(--line);
  }
}
</style>
