<template>
  <NavbarDesktop v-if="isDesktop"/>
  <NavbarMobile v-else/>
  <FooterDesktop v-if="isDesktop"/>

</template>

<script>
import NavbarDesktop from './components/NavbarDesktop.vue'
import FooterDesktop from './components/FooterDesktop.vue'

import NavbarMobile from './components/NavbarMobile.vue'
export default {
  name: 'App',
  components: {
    //Desktop
    NavbarDesktop,
    FooterDesktop,
    //Mobile
    NavbarMobile
  },
  data() {
    return {
      isDesktop: window.innerWidth >= 718,
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
      this.isDesktop = window.innerWidth > 718;
    }
  }
}
</script>

<style>

</style>
