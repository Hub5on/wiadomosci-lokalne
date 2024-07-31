<template>
  <div>
    <NavbarDesktop v-if="isDesktop"/>
    <HeaderMobile v-else/>
    <router-view/> <!-- To miejsce, w którym renderowane są komponenty na podstawie trasy -->
    <FooterDesktop v-if="isDesktop"/>
    <NavbarMobile v-else/>
  </div>
</template>

<script>
import NavbarDesktop from './components/NavbarDesktop.vue';
import FooterDesktop from './components/FooterDesktop.vue';
import HeaderMobile from './components/HeaderMobile.vue';
import NavbarMobile from './components/NavbarMobile.vue';

export default {
  name: 'App',
  components: {
    NavbarDesktop,
    FooterDesktop,
    HeaderMobile,
    NavbarMobile
  },
  data() {
    return {
      isDesktop: window.innerWidth >= 768,
      title: 'Wiadomości lokalne'
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    document.title = this.title;
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isDesktop = window.innerWidth >= 768;
    },
    changeTitle(newTitle) {
      this.title = newTitle;
      document.title = newTitle;
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');
body {
  font-family: 'Lato', sans-serif;
}
</style>
