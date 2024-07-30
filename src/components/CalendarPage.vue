<template>
  <div>
    <CalendarDesktop v-if="isDesktop"/>
    <CalendarMobile v-else/>
  </div>
</template>

<script>
import CalendarDesktop from './CalendarDesktop.vue';
import CalendarMobile from './CalendarMobile.vue';

export default {
  name: 'CalendarPage',
  data() {
    return {
      isDesktop: window.innerWidth >= 768
    };
  },
  components: {
    CalendarDesktop,
    CalendarMobile
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
