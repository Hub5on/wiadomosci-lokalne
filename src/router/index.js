import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import CalendarPage from '@/components/CalendarPage.vue';
import SettingsPage from '@/components/SettingsPage.vue';
import NotificationsPage from '@/components/NotificationsPage.vue';
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
  },
  {
    path: '/ustawienia',
    name: 'SettingsPage',
    component: SettingsPage
  },
  {
    path: '/powiadomienia',
    name: 'NotificationsPage',
    component: NotificationsPage
  }
    
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
