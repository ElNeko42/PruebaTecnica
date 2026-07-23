<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { fetchContacts } from '../api/contacts';
import { createLead, fetchLead, updateLead } from '../api/leads';
import type { Contact } from '../types';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => Boolean(route.params.id) && route.name === 'lead-edit');
const title = ref('');
const status = ref('new');
const score = ref(0);
const contactId = ref<number | null>(null);
const contacts = ref<Contact[]>([]);
const error = ref<string | null>(null);
const saving = ref(false);

onMounted(async () => {
  const list = await fetchContacts({ page: 1, pageSize: 100 });
  contacts.value = list.data;

  if (isEdit.value) {
    const lead = await fetchLead(Number(route.params.id));
    title.value = lead.title;
    status.value = lead.status;
    score.value = lead.score;
    contactId.value = lead.contactId;
  } else if (contacts.value.length) {
    contactId.value = contacts.value[0].id;
  }
});

async function onSubmit() {
  if (!contactId.value) {
    error.value = 'Contact is required.';
    return;
  }
  saving.value = true;
  error.value = null;
  try {
    if (isEdit.value) {
      await updateLead(Number(route.params.id), {
        title: title.value,
        status: status.value,
        score: score.value,
        contactId: contactId.value,
      });
      router.push(`/leads/${route.params.id}`);
    } else {
      const created = await createLead({
        title: title.value,
        status: status.value,
        score: score.value,
        contactId: contactId.value,
      });
      router.push(`/leads/${created?.id ?? ''}`);
    }
  } catch {
    error.value = 'Could not save lead.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section>
    <RouterLink class="back" to="/leads">← Back to leads</RouterLink>
    <form class="card form" @submit.prevent="onSubmit">
      <h1>{{ isEdit ? 'Edit lead' : 'New lead' }}</h1>

      <label class="label" for="title">Title</label>
      <input id="title" v-model="title" class="input" required />

      <label class="label" for="status">Status</label>
      <select id="status" v-model="status" class="select">
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="lost">Lost</option>
      </select>

      <label class="label" for="score">Score</label>
      <input id="score" v-model.number="score" class="input" type="number" min="0" />

      <label class="label" for="contact">Contact</label>
      <select id="contact" v-model.number="contactId" class="select" required>
        <option v-for="c in contacts" :key="c.id" :value="c.id">
          {{ c.name }} ({{ c.email }})
        </option>
      </select>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button class="btn" type="submit" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save' }}
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
  padding: 1.5rem;
  display: grid;
  gap: 0.7rem;
  max-width: 560px;
}

.form h1 {
  margin: 0 0 0.5rem;
}

.actions {
  margin-top: 0.5rem;
}
</style>
