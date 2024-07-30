<template>
    <div>
      <ArticlesDesktop v-if="isDesktop"/>
      <ArticlesMobile v-else/>
    </div>
  </template>
  
  <script>
  import ArticlesDesktop from './ArticlesDesktop.vue';
  import ArticlesMobile from './ArticlesMobile.vue';
  
  export default {
    name: 'HomePage',
    data() {
      return {
        isDesktop: window.innerWidth >= 768
      };
    },
    components: {
      ArticlesDesktop,
      ArticlesMobile
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
  