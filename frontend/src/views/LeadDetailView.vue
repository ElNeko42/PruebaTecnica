<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { fetchLead } from '../api/leads';
import type { Lead } from '../types';

const route = useRoute();
const lead = ref<Lead | null>(null);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    lead.value = await fetchLead(Number(route.params.id));
  } catch {
    error.value = 'Lead not found.';
  }
});
</script>

<template>
  <section>
    <RouterLink class="back" to="/leads">← Back to leads</RouterLink>

    <p v-if="error" class="error">{{ error }}</p>
    <div v-else-if="lead" class="card detail">
      <div class="title-row">
        <h1>{{ lead.title }}</h1>
        <RouterLink class="btn secondary" :to="`/leads/${lead.id}/edit`">Edit</RouterLink>
      </div>
      <dl>
        <div>
          <dt>Status</dt>
          <dd><span class="badge" :class="lead.status">{{ lead.status }}</span></dd>
        </div>
        <div>
          <dt>Score</dt>
          <dd>{{ lead.score }}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>
            <template v-if="lead.contact">
              <RouterLink :to="`/contacts/${lead.contact.id}`">
                {{ lead.contact.name }}
              </RouterLink>
            </template>
            <template v-else>
              Contact #{{ lead.contactId }} (details unavailable)
            </template>
          </dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{{ lead.owner?.name || `User #${lead.ownerId}` }}</dd>
        </div>
      </dl>
    </div>
    <p v-else class="muted">Loading…</p>
  </section>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 1rem;
}

.detail {
  padding: 1.5rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.title-row h1 {
  margin: 0;
}

dl {
  display: grid;
  gap: 1rem;
  margin: 1.25rem 0 0;
}

dt {
  font-size: 0.85rem;
  color: var(--muted);
}

dd {
  margin: 0.2rem 0 0;
}
</style>
