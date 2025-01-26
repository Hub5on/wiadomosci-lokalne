<template>
    <div>
      <NotificationsMobile v-if="isMobile"/>
    </div>
  </template>
  
  <script>
  import NotificationsMobile from './NotificationsMobile.vue';
  
  export default {
    name: 'NotificationsPage',
    data() {
      return {
        isMobile: window.innerWidth <= 768
      };
    },
    components: {
      NotificationsMobile,
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
    unmounted() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      handleResize() {
        this.isMobile = window.innerWidth <= 768;
      }
    }
  }
  </script>
  