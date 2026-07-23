<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import {
  changeLeadStatus,
  deleteLead,
  fetchLeads,
  fetchLeadTransitions,
} from '../api/leads';
import { apiErrorMessage } from '../api/errors';
import { useToast } from '../composables/useToast';
import DataTable from '../components/DataTable.vue';
import KanbanBoard from '../components/KanbanBoard.vue';
import ViewModeToggle from '../components/ViewModeToggle.vue';
import type { Lead } from '../types';

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
  { key: 'score', label: 'Score', numeric: true },
  { key: 'contact', label: 'Contact' },
];

const BOARD_COLUMNS = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'lost', label: 'Lost' },
];

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  lost: 'Lost',
};

const MODE_OPTIONS = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
];

const toast = useToast();

// Persist the chosen view so it survives navigation/refresh.
const mode = ref(localStorage.getItem('leads_view_mode') || 'list');
watch(mode, (m) => localStorage.setItem('leads_view_mode', m));

// --- List mode ---
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

async function loadList() {
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
    loadList();
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not delete the lead.'));
  }
}

watch(status, () => {
  page.value = 1;
  loadList();
});

// --- Board mode ---
const boardLeads = ref<Lead[]>([]);
const transitions = ref<Record<string, string[]>>({});
const boardLoaded = ref(false);
const boardLoading = ref(false);
const boardError = ref<string | null>(null);
const movingId = ref<number | null>(null);

async function loadBoard() {
  boardLoading.value = true;
  boardError.value = null;
  try {
    const [list, tx] = await Promise.all([
      fetchLeads({ page: 1, pageSize: 100 }),
      fetchLeadTransitions(),
    ]);
    boardLeads.value = list.data;
    transitions.value = tx;
    boardLoaded.value = true;
  } catch (err) {
    boardError.value = apiErrorMessage(err, 'Could not load the board.');
  } finally {
    boardLoading.value = false;
  }
}

// Drag-and-drop rule: a lead may be dropped only on a column its state
// machine allows (same rule the "→ Status" buttons use).
function canDrop(lead: Lead, toStatus: string) {
  return transitions.value[lead.status]?.includes(toStatus) ?? false;
}

async function move(lead: Lead, target: string) {
  movingId.value = lead.id;
  try {
    await changeLeadStatus(lead.id, target);
    lead.status = target; // reactive: card re-groups into the new column
    toast.success(`Moved to ${STATUS_LABEL[target] ?? target}.`);
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not move the lead.'));
  } finally {
    movingId.value = null;
  }
}

// Load the data the active mode needs, refreshing on switch so it stays in sync.
watch(
  mode,
  (m) => {
    if (m === 'board') loadBoard();
    else loadList();
  },
  { immediate: true },
);
</script>

<template>
  <section>
    <header class="page-header">
      <div>
        <h1>Leads</h1>
        <p class="muted">Prospect pipeline for the sales team.</p>
      </div>
      <div class="header-actions">
        <ViewModeToggle v-model="mode" :options="MODE_OPTIONS" />
        <RouterLink class="btn" to="/leads/new">New lead</RouterLink>
      </div>
    </header>

    <!-- ============ LIST MODE ============ -->
    <template v-if="mode === 'list'">
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
          @change="page = 1; loadList()"
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
          @click="page -= 1; loadList()"
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
          @click="page += 1; loadList()"
        >
          Next
        </button>
      </div>
    </template>

    <!-- ============ BOARD MODE ============ -->
    <template v-else>
      <p v-if="boardLoading && !boardLoaded" class="empty card">Loading…</p>
      <p v-else-if="boardError" class="empty card error">{{ boardError }}</p>
      <KanbanBoard
        v-else
        draggable
        :columns="BOARD_COLUMNS"
        :items="boardLeads"
        group-key="status"
        :can-drop="canDrop"
        @move="move"
      >
        <template #card="{ item }">
          <article class="lead-card card">
            <RouterLink class="lead-title" :to="`/leads/${item.id}`">
              {{ item.title }}
            </RouterLink>
            <p class="lead-meta muted">
              {{ item.contact?.name || `Contact #${item.contactId}` }} · score
              {{ item.score }}
            </p>

            <div v-if="transitions[item.status]?.length" class="moves">
              <button
                v-for="target in transitions[item.status]"
                :key="target"
                class="move-btn"
                :class="{ lost: target === 'lost' }"
                type="button"
                :disabled="movingId === item.id"
                @click="move(item, target)"
              >
                → {{ STATUS_LABEL[target] ?? target }}
              </button>
            </div>
            <p v-else class="muted terminal">No further moves</p>
          </article>
        </template>
      </KanbanBoard>
    </template>
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

.header-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
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

/* Board cards */
.lead-card {
  padding: 0.75rem 0.8rem;
  display: grid;
  gap: 0.4rem;
}

.lead-title {
  font-weight: 600;
}

.lead-meta {
  margin: 0;
  font-size: 0.82rem;
}

.moves {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.2rem;
}

.move-btn {
  border: 1px solid var(--line);
  background: white;
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--accent);
}

.move-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.move-btn.lost {
  color: var(--danger);
}

.terminal {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
}

@media (max-width: 800px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }
}
</style>
