<template>
    <div>
      <SettingsDesktop v-if="isDesktop"/>
      <SettingsMobile v-else/>
    </div>
  </template>
  
  <script>
  import SettingsDesktop from './SettingsDesktop.vue';
  import SettingsMobile from './SettingsMobile.vue';
  
  export default {
    name: 'SettingsPage',
    data() {
      return {
        isDesktop: window.innerWidth >= 768
      };
    },
    components: {
      SettingsDesktop,
      SettingsMobile
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
    unmounted() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      handleResize() {
        this.isDesktop = window.innerWidth >= 768;
      }
    }
  }
  </script>
  