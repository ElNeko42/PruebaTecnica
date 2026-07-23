<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchLeads } from '../api/leads';
import type { Lead } from '../types';

const leads = ref<Lead[]>([]);
const totalCount = ref(0);
const page = ref(1);
const pageSize = ref(10);
const status = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / pageSize.value) || 1),
);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const result = await fetchLeads({
      page: page.value,
      pageSize: pageSize.value,
      status: status.value || undefined,
    });
    leads.value = result.data;
    totalCount.value = result.totalCount;
  } catch {
    error.value = 'Could not load leads.';
  } finally {
    loading.value = false;
  }
}

watch(status, () => {
  page.value = 1;
  load();
});

onMounted(load);
</script>

<template>
  <section>
    <header class="page-header">
      <div>
        <h1>Leads</h1>
        <p class="muted">Prospect pipeline for the sales team.</p>
      </div>
      <RouterLink class="btn" to="/leads/new">New lead</RouterLink>
    </header>

    <div class="toolbar card">
      <label class="label" for="status">Status</label>
      <select id="status" v-model="status" class="select">
        <option value="">All</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="lost">Lost</option>
      </select>

      <label class="label" for="pageSize">Page size</label>
      <select
        id="pageSize"
        v-model.number="pageSize"
        class="select"
        @change="page = 1; load()"
      >
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
    </div>

    <div class="card table-wrap">
      <p v-if="loading" class="empty">Loading…</p>
      <p v-else-if="error" class="empty error">{{ error }}</p>
      <p v-else-if="!leads.length" class="empty">No leads found.</p>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Score</th>
            <th>Contact</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in leads" :key="lead.id">
            <td>
              <RouterLink :to="`/leads/${lead.id}`">{{ lead.title }}</RouterLink>
            </td>
            <td>
              <span class="badge" :class="lead.status">{{ lead.status }}</span>
            </td>
            <td>{{ lead.score }}</td>
            <td>{{ lead.contact?.name || `Contact #${lead.contactId}` }}</td>
            <td>
              <RouterLink :to="`/leads/${lead.id}/edit`">Edit</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager">
      <button
        class="btn secondary"
        type="button"
        :disabled="page <= 1"
        @click="page -= 1; load()"
      >
        Previous
      </button>
      <span class="muted">
        Page {{ page }} / {{ totalPages }} · {{ totalCount }} total
      </span>
      <button
        class="btn secondary"
        type="button"
        :disabled="page >= totalPages"
        @click="page += 1; load()"
      >
        Next
      </button>
    </div>
  </section>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.page-header h1 {
  margin: 0 0 0.25rem;
}

.toolbar {
  display: grid;
  grid-template-columns: auto 1fr auto 120px;
  gap: 0.75rem;
  align-items: end;
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

@media (max-width: 800px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
