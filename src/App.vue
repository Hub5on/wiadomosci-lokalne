<template>
  
  <NavbarDesktop v-if="isDesktop"/>
  <HeaderMobile v-else/>
  <ArticlesMobile v-if="!isDesktop"/>
  <FooterDesktop v-if="isDesktop"/>
  <NavbarMobile v-else/>

</template>

<script>
import NavbarDesktop from './components/NavbarDesktop.vue'
import FooterDesktop from './components/FooterDesktop.vue'
import HeaderMobile from './components/HeaderMobile.vue'
import NavbarMobile from './components/NavbarMobile.vue'
import ArticlesMobile from './components/ArticlesMobile.vue'

export default {
  name: 'App',
  components: {
    //Desktop
    NavbarDesktop,
    FooterDesktop,
    //Mobile
    HeaderMobile,
    ArticlesMobile,
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
@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');
body{
  font-family: 'Lato', sans-serif;
}
</style>
