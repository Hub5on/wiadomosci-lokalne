<template>
  <NavbarDesktop v-if="isDesktop"/>
  <AppFooter v-if="isDesktop"/>
</template>

<script>
import NavbarDesktop from './components/NavbarDesktop.vue'
import AppFooter from './components/AppFooter.vue'
export default {
  name: 'App',
  components: {
    NavbarDesktop,
    AppFooter
  },
  data() {
    return {
      isDesktop: window.innerWidth >= 720
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isDesktop = window.innerWidth > 768;
    }
  }
}
</script>

<style>

</style>
