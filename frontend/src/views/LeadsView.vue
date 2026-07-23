<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { deleteLead, fetchLeads } from '../api/leads';
import { apiErrorMessage } from '../api/errors';
import { useToast } from '../composables/useToast';
import DataTable from '../components/DataTable.vue';
import type { Lead } from '../types';

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
  { key: 'score', label: 'Score', numeric: true },
  { key: 'contact', label: 'Contact' },
];

const toast = useToast();
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
  } catch (err) {
    error.value = apiErrorMessage(err, 'Could not load leads.');
  } finally {
    loading.value = false;
  }
}

async function deleteOne(lead: Lead) {
  if (!confirm(`Delete "${lead.title}"? This cannot be undone.`)) return;
  try {
    await deleteLead(lead.id);
    toast.success('Lead deleted.');
    load();
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not delete the lead.'));
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

    <DataTable
      :columns="COLUMNS"
      :rows="leads"
      :loading="loading"
      :error="error"
      empty-text="No leads found."
    >
      <template #title="{ row }">
        <RouterLink :to="`/leads/${row.id}`">{{ row.title }}</RouterLink>
      </template>
      <template #status="{ row }">
        <span class="badge" :class="row.status">{{ row.status }}</span>
      </template>
      <template #contact="{ row }">
        {{ row.contact?.name || `Contact #${row.contactId}` }}
      </template>
      <template #actions="{ row }">
        <div class="row-actions">
          <RouterLink :to="`/leads/${row.id}/edit`">Edit</RouterLink>
          <button class="link-btn danger" type="button" @click="deleteOne(row)">
            Delete
          </button>
        </div>
      </template>
    </DataTable>

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

.row-actions {
  display: inline-flex;
  gap: 0.9rem;
  align-items: center;
  justify-content: flex-end;
}

.link-btn {
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  padding: 0;
  font: inherit;
}

.link-btn.danger {
  color: var(--danger);
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
