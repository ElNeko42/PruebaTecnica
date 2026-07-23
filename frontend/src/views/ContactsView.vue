<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchContacts } from '../api/contacts';
import type { Contact } from '../types';

const contacts = ref<Contact[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const q = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const result = await fetchContacts({
      page: page.value,
      pageSize: pageSize.value,
      q: q.value || undefined,
    });
    contacts.value = result.data;
    total.value = result.total;
  } catch {
    error.value = 'Could not load contacts.';
  } finally {
    loading.value = false;
  }
}

function prev() {
  if (page.value > 1) {
    page.value -= 1;
    load();
  }
}

function next() {
  if (page.value * pageSize.value < total.value) {
    page.value += 1;
    load();
  }
}

onMounted(load);
</script>

<template>
  <section>
    <header class="page-header">
      <div>
        <h1>Contacts</h1>
        <p class="muted">Customer and prospect directory.</p>
      </div>
    </header>

    <div class="toolbar card">
      <input
        v-model="q"
        class="input"
        type="search"
        placeholder="Search by name…"
        @keyup.enter="page = 1; load()"
      />
      <button class="btn secondary" type="button" @click="page = 1; load()">
        Search
      </button>
    </div>

    <div class="card table-wrap">
      <p v-if="loading" class="empty">Loading…</p>
      <p v-else-if="error" class="empty error">{{ error }}</p>
      <p v-else-if="!contacts.length" class="empty">No contacts found.</p>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in contacts" :key="contact.id">
            <td>
              <RouterLink :to="`/contacts/${contact.id}`">{{ contact.name }}</RouterLink>
            </td>
            <td>{{ contact.email }}</td>
            <td>{{ contact.company || '—' }}</td>
            <td>{{ contact.phone || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager">
      <button class="btn secondary" type="button" :disabled="page <= 1" @click="prev">
        Previous
      </button>
      <span class="muted">Page {{ page }} · {{ total }} total</span>
      <button
        class="btn secondary"
        type="button"
        :disabled="page * pageSize >= total"
        @click="next"
      >
        Next
      </button>
    </div>
  </section>
</template>

<style scoped>
.page-header {
  margin-bottom: 1.25rem;
}

.page-header h1 {
  margin: 0 0 0.25rem;
}

.toolbar {
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem;
  margin-bottom: 1rem;
}

.table-wrap {
  overflow: auto;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  gap: 1rem;
}
</style>
