<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { fetchContacts } from '../api/contacts';
import {
  createOpportunity,
  fetchOpportunity,
  updateOpportunity,
} from '../api/opportunities';
import { apiErrorMessage } from '../api/errors';
import { useToast } from '../composables/useToast';
import type { Contact, OpportunityStage } from '../types';

const STAGES: OpportunityStage[] = [
  'prospecting',
  'proposal',
  'negotiation',
  'won',
  'lost',
];

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isEdit = computed(() => route.name === 'opportunity-edit');

const form = reactive({
  title: '',
  amount: null as number | null,
  stage: 'prospecting' as OpportunityStage,
  contactId: null as number | null,
});

const contacts = ref<Contact[]>([]);
const loading = ref(true);
const saving = ref(false);
const submitted = ref(false);

// Client-side validation: amount must be > 0; contact is required; title required.
const errors = computed(() => ({
  title: !form.title.trim() ? 'Title is required.' : '',
  amount:
    form.amount === null || Number.isNaN(form.amount)
      ? 'Amount is required.'
      : form.amount <= 0
        ? 'Amount must be greater than 0.'
        : '',
  contactId: !form.contactId ? 'Contact is required.' : '',
}));

const isValid = computed(() => Object.values(errors.value).every((e) => !e));

onMounted(async () => {
  try {
    const list = await fetchContacts({ page: 1, pageSize: 100 });
    contacts.value = list.data;

    if (isEdit.value) {
      const opp = await fetchOpportunity(Number(route.params.id));
      form.title = opp.title;
      form.amount = opp.amount;
      form.stage = opp.stage;
      form.contactId = opp.contactId;
    }
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not load the form.'));
  } finally {
    loading.value = false;
  }
});

async function onSubmit() {
  submitted.value = true;
  if (!isValid.value) return;

  saving.value = true;
  try {
    const payload = {
      title: form.title.trim(),
      amount: form.amount as number,
      stage: form.stage,
      contactId: form.contactId as number,
    };

    if (isEdit.value) {
      await updateOpportunity(Number(route.params.id), payload);
      toast.success('Opportunity updated.');
      router.push(`/opportunities/${route.params.id}`);
    } else {
      const created = await createOpportunity(payload);
      toast.success('Opportunity created.');
      router.push(`/opportunities/${created.id}`);
    }
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not save the opportunity.'));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="wrap">
    <RouterLink class="back" to="/opportunities">← Back to opportunities</RouterLink>

    <form class="card form" novalidate @submit.prevent="onSubmit">
      <h1>{{ isEdit ? 'Edit opportunity' : 'New opportunity' }}</h1>

      <p v-if="loading" class="muted">Loading…</p>

      <template v-else>
        <div class="field">
          <label class="label" for="title">Title</label>
          <input
            id="title"
            v-model="form.title"
            class="input"
            :class="{ invalid: submitted && errors.title }"
            placeholder="e.g. Enterprise license renewal"
          />
          <p v-if="submitted && errors.title" class="field-error">
            {{ errors.title }}
          </p>
        </div>

        <div class="field">
          <label class="label" for="amount">Amount (€)</label>
          <input
            id="amount"
            v-model.number="form.amount"
            class="input"
            :class="{ invalid: submitted && errors.amount }"
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            placeholder="0.00"
          />
          <p v-if="submitted && errors.amount" class="field-error">
            {{ errors.amount }}
          </p>
        </div>

        <div class="field">
          <label class="label" for="stage">Stage</label>
          <select id="stage" v-model="form.stage" class="select">
            <option v-for="s in STAGES" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="field">
          <label class="label" for="contact">Contact</label>
          <select
            id="contact"
            v-model.number="form.contactId"
            class="select"
            :class="{ invalid: submitted && errors.contactId }"
          >
            <option :value="null" disabled>Select a contact…</option>
            <option v-for="c in contacts" :key="c.id" :value="c.id">
              {{ c.name }} ({{ c.email }})
            </option>
          </select>
          <p v-if="submitted && errors.contactId" class="field-error">
            {{ errors.contactId }}
          </p>
        </div>

        <div class="actions">
          <RouterLink class="btn secondary" to="/opportunities">Cancel</RouterLink>
          <button class="btn" type="submit" :disabled="saving">
            {{ saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create' }}
          </button>
        </div>
      </template>
    </form>
  </section>
</template>

<style scoped>
.wrap {
  max-width: 560px;
  margin: 0 auto;
}

.back {
  display: inline-block;
  margin-bottom: 1rem;
}

.form {
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.form h1 {
  margin: 0;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.input.invalid,
.select.invalid {
  border-color: var(--danger);
  background: #fef6f5;
}

.field-error {
  margin: 0;
  color: var(--danger);
  font-size: 0.82rem;
}

.actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

@media (max-width: 540px) {
  .form {
    padding: 1.1rem;
  }
  .actions {
    flex-direction: column-reverse;
  }
  .actions .btn {
    width: 100%;
  }
}
</style>
