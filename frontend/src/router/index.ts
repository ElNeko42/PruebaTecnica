import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import AppLayout from '../layouts/AppLayout.vue';
import ContactsView from '../views/ContactsView.vue';
import ContactDetailView from '../views/ContactDetailView.vue';
import LeadsView from '../views/LeadsView.vue';
import LeadFormView from '../views/LeadFormView.vue';
import LeadDetailView from '../views/LeadDetailView.vue';
import OpportunitiesView from '../views/OpportunitiesView.vue';
import OpportunityFormView from '../views/OpportunityFormView.vue';
import OpportunityDetailView from '../views/OpportunityDetailView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', redirect: '/leads' },
        { path: 'contacts', name: 'contacts', component: ContactsView },
        { path: 'contacts/:id', name: 'contact-detail', component: ContactDetailView },
        { path: 'leads', name: 'leads', component: LeadsView },
        { path: 'leads/new', name: 'lead-new', component: LeadFormView },
        { path: 'leads/:id', name: 'lead-detail', component: LeadDetailView },
        { path: 'leads/:id/edit', name: 'lead-edit', component: LeadFormView },
        {
          path: 'opportunities',
          name: 'opportunities',
          component: OpportunitiesView,
        },
        {
          path: 'opportunities/new',
          name: 'opportunity-new',
          component: OpportunityFormView,
        },
        {
          path: 'opportunities/:id',
          name: 'opportunity-detail',
          component: OpportunityDetailView,
        },
        {
          path: 'opportunities/:id/edit',
          name: 'opportunity-edit',
          component: OpportunityFormView,
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'leads' };
  }
  return true;
});

export default router;
