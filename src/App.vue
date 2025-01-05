<template>
  <div>
    <NavbarDesktop v-if="isDesktop" />
    <HeaderMobile v-else />
    <UpdateNotification />
    <router-view /> <!-- To miejsce, w którym renderowane są komponenty na podstawie trasy -->
    <FooterDesktop v-if="isDesktop" />
    <NavbarMobile v-else />
  </div>
</template>

<script>
import NavbarDesktop from './components/NavbarDesktop.vue';
import FooterDesktop from './components/FooterDesktop.vue';
import HeaderMobile from './components/HeaderMobile.vue';
import NavbarMobile from './components/NavbarMobile.vue';
import UpdateNotification from './components/UpdateNotification.vue';

export default {
  name: 'App',
  components: {
    NavbarDesktop,
    FooterDesktop,
    HeaderMobile,
    NavbarMobile,
    UpdateNotification
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
    },
    refreshApp() {
      this.updateExists = false
      if (!this.registration || !this.registration.waiting) return
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');

body {
  font-family: 'Lato', sans-serif;
}
:root {
  --background-color-light: white;
  --text-color-light: black;
  --background-color-dark: #121212;
  --text-color-dark: white;
}

body[data-theme='light'] {
  background-color: var(--background-color-light);
  color: var(--text-color-light);
}

body[data-theme='dark'] {
  background-color: var(--background-color-dark);
  color: var(--text-color-dark);
}
</style>
