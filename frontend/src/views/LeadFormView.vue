<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { fetchContacts } from '../api/contacts';
import { createLead, fetchLead, updateLead } from '../api/leads';
import { apiErrorMessage } from '../api/errors';
import { useToast } from '../composables/useToast';
import FormField from '../components/form/FormField.vue';
import BaseInput from '../components/form/BaseInput.vue';
import SearchableSelect from '../components/form/SearchableSelect.vue';
import type { Contact } from '../types';

const STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Lost', value: 'lost' },
];

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isEdit = computed(
  () => Boolean(route.params.id) && route.name === 'lead-edit',
);

const form = reactive({
  title: '',
  status: 'new',
  score: 0,
  contactId: null as number | null,
});

const contacts = ref<Contact[]>([]);
const contactOptions = computed(() =>
  contacts.value.map((c) => ({
    label: `${c.name} (${c.email})`,
    value: c.id as number | null,
  })),
);

const saving = ref(false);
const submitted = ref(false);

const errors = computed(() => ({
  title: !form.title.trim() ? 'Title is required.' : '',
  contactId: !form.contactId ? 'Contact is required.' : '',
}));

const isValid = computed(() => Object.values(errors.value).every((e) => !e));

onMounted(async () => {
  try {
    const list = await fetchContacts({ page: 1, pageSize: 100 });
    contacts.value = list.data;

    if (isEdit.value) {
      const lead = await fetchLead(Number(route.params.id));
      form.title = lead.title;
      form.status = lead.status;
      form.score = lead.score;
      form.contactId = lead.contactId;
    } else if (contacts.value.length) {
      form.contactId = contacts.value[0].id;
    }
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not load the form.'));
  }
});

async function onSubmit() {
  submitted.value = true;
  if (!isValid.value) return;

  saving.value = true;
  try {
    const payload = {
      title: form.title.trim(),
      status: form.status,
      score: form.score,
      contactId: form.contactId as number,
    };

    if (isEdit.value) {
      await updateLead(Number(route.params.id), payload);
      toast.success('Lead updated.');
      router.push(`/leads/${route.params.id}`);
    } else {
      const created = await createLead(payload);
      toast.success('Lead created.');
      router.push(`/leads/${created?.id ?? ''}`);
    }
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Could not save the lead.'));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section>
    <RouterLink class="back" to="/leads">← Back to leads</RouterLink>

    <form class="card form" novalidate @submit.prevent="onSubmit">
      <h1>{{ isEdit ? 'Edit lead' : 'New lead' }}</h1>

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
            placeholder="e.g. Pricing inquiry"
          />
        </FormField>

        <FormField label="Status" html-for="status">
          <SearchableSelect
            id="status"
            v-model="form.status"
            :options="STATUS_OPTIONS"
          />
        </FormField>

        <FormField label="Score" html-for="score">
          <BaseInput id="score" v-model="form.score" type="number" min="0" />
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
        <RouterLink class="btn secondary" to="/leads">Cancel</RouterLink>
        <button class="btn" type="submit" :disabled="saving">
          {{ saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create' }}
        </button>
      </div>
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
