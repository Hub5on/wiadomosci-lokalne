<template>
  <div class="navbar-mobile fixed-bottom bg-light">
    <div class="d-flex justify-content-between align-items-center py-2">
      <div class="text-center px-2">
        <router-link to="/">
          <i :class="['bi', currentRoute === '/' ? 'bi-house-door-fill' : 'bi-house-door', 'text-dark']"></i>
        </router-link>
      </div>
      <div class="text-center px-2">
        <router-link to="/kalendarz">
          <!-- Dynamiczna zmiana klasy ikony na podstawie aktywnej ścieżki -->
          <i :class="['bi', currentRoute === '/kalendarz' ? 'bi-calendar-fill' : 'bi-calendar', 'text-dark']"></i>
        </router-link>
      </div>
      <div class="text-center px-2">
        <router-link to="/powiadomienia">
          <i :class="['bi', currentRoute === '/powiadomienia' ? 'bi-bell-fill' : 'bi-bell', 'text-dark']"></i>
        </router-link>
      </div>
      <div class="text-center px-2">
        <router-link to="/ustawienia">
          <i :class="['bi', currentRoute === '/ustawienia' ? 'bi-gear-fill' : 'bi-gear', 'text-dark']"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavbarMobile',
  computed: {
    currentRoute() {
      return this.$route.path;
    }
  }
}
</script>


<style scoped>
.navbar-mobile {
  width: 100%;
  box-sizing: border-box;
}

.navbar-mobile .d-flex {
  width: 100%;
}

.text-center {
  flex: 1;
}

.text-center > a {
  display: block;
  padding: 0.5rem; /* Adjust this value as needed */
}

.text-center > a i {
  font-size: 24px;
}
</style>
