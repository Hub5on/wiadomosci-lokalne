import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import CalendarPage from '@/components/CalendarPage.vue';

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/kalendarz',
    name: 'CalendarPage',
    component: CalendarPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
