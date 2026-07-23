import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import http from '../api/http';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
};

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('leadflow_token'));
  const user = ref<AuthUser | null>(
    localStorage.getItem('leadflow_user')
      ? JSON.parse(localStorage.getItem('leadflow_user') as string)
      : null,
  );
  const error = ref<string | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value));

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await http.post('/auth/login', { email, password });
      token.value = data.accessToken;
      user.value = data.user;
      localStorage.setItem('leadflow_token', data.accessToken);
      localStorage.setItem('leadflow_user', JSON.stringify(data.user));
    } catch (err: unknown) {
      error.value = 'Invalid credentials';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('leadflow_token');
    localStorage.removeItem('leadflow_user');
  }

  return { token, user, error, loading, isAuthenticated, login, logout };
});
