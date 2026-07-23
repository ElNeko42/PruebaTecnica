<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { fetchContact } from '../api/contacts';
import type { Contact } from '../types';

const route = useRoute();
const contact = ref<Contact | null>(null);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    contact.value = await fetchContact(Number(route.params.id));
  } catch {
    error.value = 'Contact not found.';
  }
});
</script>

<template>
  <section>
    <RouterLink class="back" to="/contacts">← Back to contacts</RouterLink>

    <p v-if="error" class="error">{{ error }}</p>
    <div v-else-if="contact" class="card detail">
      <h1>{{ contact.name }}</h1>
      <dl>
        <div>
          <dt>Email</dt>
          <dd>{{ contact.email }}</dd>
        </div>
        <div>
          <dt>Company</dt>
          <dd>{{ contact.company || '—' }}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{{ contact.phone || '—' }}</dd>
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

.detail h1 {
  margin-top: 0;
}

dl {
  display: grid;
  gap: 1rem;
  margin: 0;
}

dt {
  font-size: 0.85rem;
  color: var(--muted);
}

dd {
  margin: 0.2rem 0 0;
}
</style>
