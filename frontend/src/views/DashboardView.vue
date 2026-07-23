<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchStatsSummary } from '../api/stats';
import { apiErrorMessage } from '../api/errors';
import StatCard from '../components/StatCard.vue';
import BarChart from '../components/BarChart.vue';
import type { StatsSummary } from '../types';

const stats = ref<StatsSummary | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const currency = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const STATUS_COLORS: Record<string, string> = {
  new: '#0f6e56',
  contacted: '#2f8f76',
  qualified: '#59b39a',
  lost: '#b42318',
};

const leadBars = computed(() => {
  if (!stats.value) return [];
  return Object.entries(stats.value.leads.byStatus).map(([status, count]) => ({
    label: status,
    value: count,
    color: STATUS_COLORS[status],
  }));
});

const stageBars = computed(() => {
  if (!stats.value) return [];
  return Object.entries(stats.value.opportunities.byStage).map(
    ([stage, bucket]) => ({
      label: stage,
      value: bucket.amount,
      display: currency.format(bucket.amount),
      color: stage === 'lost' ? '#b42318' : undefined,
    }),
  );
});

onMounted(async () => {
  try {
    stats.value = await fetchStatsSummary();
  } catch (err) {
    error.value = apiErrorMessage(err, 'Could not load dashboard stats.');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section>
    <header class="page-header">
      <h1>Dashboard</h1>
      <p class="muted">A snapshot of leads and the opportunity pipeline.</p>
    </header>

    <p v-if="loading" class="empty card">Loading…</p>
    <p v-else-if="error" class="empty card error">{{ error }}</p>

    <template v-else-if="stats">
      <div class="kpis">
        <StatCard label="Total leads" :value="stats.leads.total" />
        <StatCard label="Opportunities" :value="stats.opportunities.total" />
        <StatCard
          label="Open pipeline"
          :value="currency.format(stats.opportunities.open.amount)"
          :hint="`${stats.opportunities.open.count} open`"
        />
        <StatCard
          label="Won"
          :value="currency.format(stats.opportunities.won.amount)"
          :hint="`${stats.opportunities.won.count} deals`"
        />
      </div>

      <div class="panels">
        <div class="panel card">
          <h2>Leads by status</h2>
          <BarChart :items="leadBars" />
        </div>

        <div class="panel card">
          <h2>Pipeline amount by stage</h2>
          <BarChart v-if="stats.opportunities.total" :items="stageBars" />
          <p v-else class="muted empty-panel">
            No opportunities yet — create some to see the pipeline here.
          </p>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.page-header {
  margin-bottom: 1.25rem;
}

.page-header h1 {
  margin: 0 0 0.25rem;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.panel {
  padding: 1.25rem;
}

.panel h2 {
  margin: 0 0 1rem;
  font-size: 1.05rem;
}

.empty-panel {
  padding: 1rem 0;
}

@media (max-width: 900px) {
  .kpis {
    grid-template-columns: repeat(2, 1fr);
  }
  .panels {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .kpis {
    grid-template-columns: 1fr;
  }
}
</style>
