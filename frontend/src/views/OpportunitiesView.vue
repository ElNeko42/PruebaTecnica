<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { deleteOpportunity, fetchOpportunities } from '../api/opportunities';
import { fetchContacts } from '../api/contacts';
import { apiErrorMessage } from '../api/errors';
import { useToast } from '../composables/useToast';
import { useDebounceFn } from '../composables/useDebounceFn';
import DataTable from '../components/DataTable.vue';
import BaseInput from '../components/form/BaseInput.vue';
import BaseSelect from '../components/form/BaseSelect.vue';
import SearchableSelect from '../components/form/SearchableSelect.vue';
import type { Contact, Opportunity, OpportunityStage } from '../types';

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'stage', label: 'Stage' },
  { key: 'amount', label: 'Amount', numeric: true },
  { key: 'contact', label: 'Contact' },
];

const STAGE_OPTIONS: { label: string; value: string }[] = [
  { label: 'All stages', value: '' },
  { label: 'Prospecting', value: 'prospecting' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
];

const toast = useToast();
const opportunities = ref<Opportunity[]>([]);
const totalCount = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const error = ref<string | null>(null);

const filters = reactive({
  q: '',
  stage: '' as '' | OpportunityStage,
  contactId: null as number | null,
  amountMin: null as number | null,
  amountMax: null as number | null,
});

const contacts = ref<Contact[]>([]);
const contactOptions = computed(() => [
  { label: 'Any contact', value: null as number | null },
  ...contacts.value.map((c) => ({ label: c.name, value: c.id as number | null })),
]);

const selectedIds = ref<(string | number)[]>([]);
const deleting = ref(false);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / pageSize.value) || 1),
);

const currency = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const result = await fetchOpportunities({
      page: page.value,
      pageSize: pageSize.value,
      stage: filters.stage || undefined,
      q: filters.q.trim() || undefined,
      contactId: filters.contactId ?? undefined,
      amountMin: filters.amountMin ?? undefined,
      amountMax: filters.amountMax ?? undefined,
    });
    opportunities.value = result.data;
    totalCount.value = result.totalCount;
  } catch (err) {
    error.value = apiErrorMessage(err, 'Could not load opportunities.');
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

const debouncedReload = useDebounceFn(() => {
  page.value = 1;
  load();
}, 300);

// Any filter change resets to page 1 and reloads (debounced for typing).
watch(filters, debouncedReload);

function resetFilters() {
  filters.q = '';
  filters.stage = '';
  filters.contactId = null;
  filters.amountMin = null;
  filters.amountMax = null;
}

async function deleteOne(o: Opportunity) {
  if (!confirm(`Delete "${o.title}"? This cannot be undone.`)) return;
  try {
    await deleteOpportunity(o.id);
    toast.success('Opportunity deleted.');
    selectedIds.value = selectedIds.value.filter((id) => id !== o.id);
    load();
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not delete the opportunity.'));
  }
}

async function deleteSelected() {
  const count = selectedIds.value.length;
  if (!count) return;
  if (!confirm(`Delete ${count} selected opportunit${count === 1 ? 'y' : 'ies'}?`))
    return;
  deleting.value = true;
  try {
    await Promise.all(
      selectedIds.value.map((id) => deleteOpportunity(Number(id))),
    );
    toast.success(`Deleted ${count} opportunit${count === 1 ? 'y' : 'ies'}.`);
    selectedIds.value = [];
    load();
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not delete the selected items.'));
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  try {
    const list = await fetchContacts({ page: 1, pageSize: 100 });
    contacts.value = list.data;
  } catch {
    // Contact filter is optional; ignore load failure here.
  }
  load();
});
</script>

<template>
  <section>
    <header class="page-header">
      <div>
        <h1>Opportunities</h1>
        <p class="muted">Deals in the sales pipeline.</p>
      </div>
      <div class="header-actions">
        <button
          v-if="selectedIds.length"
          class="btn danger"
          type="button"
          :disabled="deleting"
          @click="deleteSelected"
        >
          Delete selected ({{ selectedIds.length }})
        </button>
        <RouterLink class="btn" to="/opportunities/new">New opportunity</RouterLink>
      </div>
    </header>

    <div class="toolbar card">
      <div class="filter">
        <label class="label" for="f-title">Title</label>
        <BaseInput id="f-title" v-model="filters.q" placeholder="Search title…" />
      </div>

      <div class="filter">
        <label class="label" for="f-stage">Stage</label>
        <BaseSelect id="f-stage" v-model="filters.stage" :options="STAGE_OPTIONS" />
      </div>

      <div class="filter">
        <label class="label" for="f-contact">Contact</label>
        <SearchableSelect
          id="f-contact"
          v-model="filters.contactId"
          :options="contactOptions"
          placeholder="Any contact"
        />
      </div>

      <div class="filter">
        <label class="label" for="f-min">Min €</label>
        <BaseInput id="f-min" v-model="filters.amountMin" type="number" min="0" placeholder="0" />
      </div>

      <div class="filter">
        <label class="label" for="f-max">Max €</label>
        <BaseInput id="f-max" v-model="filters.amountMax" type="number" min="0" placeholder="∞" />
      </div>

      <button class="btn ghost reset" type="button" @click="resetFilters">
        Clear
      </button>
    </div>

    <DataTable
      v-model:selected="selectedIds"
      selectable
      :columns="COLUMNS"
      :rows="opportunities"
      :loading="loading"
      :error="error"
      empty-text="No opportunities match these filters."
    >
      <template #title="{ row }">
        <RouterLink :to="`/opportunities/${row.id}`">{{ row.title }}</RouterLink>
      </template>
      <template #stage="{ row }">
        <span class="badge" :class="row.stage">{{ row.stage }}</span>
      </template>
      <template #amount="{ row }">{{ currency.format(row.amount) }}</template>
      <template #contact="{ row }">
        {{ row.contact?.name || `Contact #${row.contactId}` }}
      </template>
      <template #actions="{ row }">
        <div class="row-actions">
          <RouterLink :to="`/opportunities/${row.id}/edit`">Edit</RouterLink>
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

.header-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.btn.danger {
  background: var(--danger);
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

.toolbar {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 0.8fr 0.8fr auto;
  gap: 0.75rem;
  align-items: end;
  padding: 0.9rem;
  margin-bottom: 1rem;
}

.filter {
  min-width: 0;
}

.reset {
  height: fit-content;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  gap: 1rem;
}

.badge.won {
  background: var(--accent-soft);
  color: var(--accent);
}

@media (max-width: 900px) {
  .toolbar {
    grid-template-columns: 1fr 1fr;
  }
  .reset {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }
  .page-header .btn {
    width: 100%;
  }
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
