<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  deleteOpportunity,
  fetchOpportunity,
} from '../api/opportunities';
import { apiErrorMessage } from '../api/errors';
import { useToast } from '../composables/useToast';
import type { Opportunity } from '../types';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const opportunity = ref<Opportunity | null>(null);
const error = ref<string | null>(null);
const deleting = ref(false);

const currency = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

onMounted(async () => {
  try {
    opportunity.value = await fetchOpportunity(Number(route.params.id));
  } catch (err) {
    error.value = apiErrorMessage(err, 'Opportunity not found.');
  }
});

async function onDelete() {
  if (!opportunity.value) return;
  if (!confirm('Delete this opportunity? This cannot be undone.')) return;
  deleting.value = true;
  try {
    await deleteOpportunity(opportunity.value.id);
    toast.success('Opportunity deleted.');
    router.push('/opportunities');
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not delete the opportunity.'));
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <section>
    <RouterLink class="back" to="/opportunities">← Back to opportunities</RouterLink>

    <p v-if="error" class="error">{{ error }}</p>
    <div v-else-if="opportunity" class="card detail">
      <div class="title-row">
        <h1>{{ opportunity.title }}</h1>
        <div class="title-actions">
          <RouterLink
            class="btn secondary"
            :to="`/opportunities/${opportunity.id}/edit`"
          >
            Edit
          </RouterLink>
          <button class="btn ghost danger" type="button" :disabled="deleting" @click="onDelete">
            Delete
          </button>
        </div>
      </div>
      <dl>
        <div>
          <dt>Amount</dt>
          <dd>{{ currency.format(opportunity.amount) }}</dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd><span class="badge" :class="opportunity.stage">{{ opportunity.stage }}</span></dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>
            <RouterLink
              v-if="opportunity.contact"
              :to="`/contacts/${opportunity.contact.id}`"
            >
              {{ opportunity.contact.name }}
            </RouterLink>
            <template v-else>Contact #{{ opportunity.contactId }}</template>
          </dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{{ opportunity.owner?.name || `User #${opportunity.ownerId}` }}</dd>
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
  flex-wrap: wrap;
}

.title-row h1 {
  margin: 0;
}

.title-actions {
  display: flex;
  gap: 0.5rem;
}

.btn.danger {
  color: var(--danger);
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

.badge.won {
  background: var(--accent-soft);
  color: var(--accent);
}
</style>
