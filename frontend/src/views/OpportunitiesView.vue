<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchOpportunities } from '../api/opportunities';
import { apiErrorMessage } from '../api/errors';
import { useToast } from '../composables/useToast';
import type { Opportunity, OpportunityStage } from '../types';

const STAGES: OpportunityStage[] = [
  'prospecting',
  'proposal',
  'negotiation',
  'won',
  'lost',
];

const toast = useToast();
const opportunities = ref<Opportunity[]>([]);
const totalCount = ref(0);
const page = ref(1);
const pageSize = ref(10);
const stage = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

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
      stage: stage.value || undefined,
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

watch(stage, () => {
  page.value = 1;
  load();
});

onMounted(load);
</script>

<template>
  <section>
    <header class="page-header">
      <div>
        <h1>Opportunities</h1>
        <p class="muted">Deals in the sales pipeline.</p>
      </div>
      <RouterLink class="btn" to="/opportunities/new">New opportunity</RouterLink>
    </header>

    <div class="toolbar card">
      <label class="label" for="stage">Stage</label>
      <select id="stage" v-model="stage" class="select">
        <option value="">All</option>
        <option v-for="s in STAGES" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <div class="card table-wrap">
      <p v-if="loading" class="empty">Loading…</p>
      <p v-else-if="error" class="empty error">{{ error }}</p>
      <p v-else-if="!opportunities.length" class="empty">
        No opportunities yet. Create your first one.
      </p>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Stage</th>
            <th class="num">Amount</th>
            <th>Contact</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in opportunities" :key="o.id">
            <td>
              <RouterLink :to="`/opportunities/${o.id}`">{{ o.title }}</RouterLink>
            </td>
            <td><span class="badge" :class="o.stage">{{ o.stage }}</span></td>
            <td class="num">{{ currency.format(o.amount) }}</td>
            <td>{{ o.contact?.name || `Contact #${o.contactId}` }}</td>
            <td>
              <RouterLink :to="`/opportunities/${o.id}/edit`">Edit</RouterLink>
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
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.9rem;
  margin-bottom: 1rem;
}

.toolbar .select {
  max-width: 220px;
}

.table-wrap {
  overflow-x: auto;
}

.num {
  text-align: right;
  white-space: nowrap;
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

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }
  .page-header .btn {
    width: 100%;
  }
}
</style>
