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
import FormField from '../components/form/FormField.vue';
import BaseInput from '../components/form/BaseInput.vue';
import SearchableSelect from '../components/form/SearchableSelect.vue';
import type { Contact, OpportunityStage } from '../types';

const STAGE_OPTIONS: { label: string; value: OpportunityStage }[] = [
  { label: 'Prospecting', value: 'prospecting' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
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
const contactOptions = computed(() =>
  contacts.value.map((c) => ({
    label: `${c.name} (${c.email})`,
    value: c.id as number | null,
  })),
);

const loading = ref(true);
const saving = ref(false);
const submitted = ref(false);

// Validación en cliente: el importe debe ser > 0; contacto obligatorio; título obligatorio.
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
  <section>
    <RouterLink class="back" to="/opportunities">← Back to opportunities</RouterLink>

    <form class="card form" novalidate @submit.prevent="onSubmit">
      <h1>{{ isEdit ? 'Edit opportunity' : 'New opportunity' }}</h1>

      <p v-if="loading" class="muted">Loading…</p>

      <template v-else>
        <div class="form-grid">
          <FormField
            class="span-2"
            label="Title"
            html-for="title"
            :error="submitted ? errors.title : ''"
            v-slot="{ invalid }"
          >
            <BaseInput
              id="title"
              v-model="form.title"
              :invalid="invalid"
              placeholder="e.g. Enterprise license renewal"
            />
          </FormField>

          <FormField
            label="Amount (€)"
            html-for="amount"
            :error="submitted ? errors.amount : ''"
            v-slot="{ invalid }"
          >
            <BaseInput
              id="amount"
              v-model="form.amount"
              type="number"
              :invalid="invalid"
              min="0"
              step="0.01"
              inputmode="decimal"
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Stage" html-for="stage">
            <SearchableSelect
              id="stage"
              v-model="form.stage"
              :options="STAGE_OPTIONS"
            />
          </FormField>

          <FormField
            class="span-2"
            label="Contact"
            html-for="contact"
            :error="submitted ? errors.contactId : ''"
            v-slot="{ invalid }"
          >
            <SearchableSelect
              id="contact"
              v-model="form.contactId"
              :options="contactOptions"
              :invalid="invalid"
              placeholder="Search a contact…"
            />
          </FormField>
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
.back {
  display: inline-block;
  margin-bottom: 1rem;
}

.form {
  padding: 1.75rem;
  display: grid;
  gap: 1.25rem;
}

.form h1 {
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
}

.span-2 {
  grid-column: 1 / -1;
}

.actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .form {
    padding: 1.1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .actions {
    flex-direction: column-reverse;
  }
  .actions .btn {
    width: 100%;
  }
}
</style>
