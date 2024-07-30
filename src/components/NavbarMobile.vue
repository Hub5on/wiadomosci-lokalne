<template>
  <div class="navbar-mobile fixed-bottom bg-light">
    <div class="d-flex justify-content-between align-items-center py-2">
      <div class="text-center px-2">
        <router-link to="/">
          <i class="bi bi-house-door text-dark" style="font-size: 24px;"></i>
        </router-link>
      </div>
      <div class="text-center px-2">
        <router-link to="/calendar">
          <i class="bi bi-calendar text-dark" style="font-size: 24px;"></i>
        </router-link>
      </div>
      <div class="text-center px-2">
        <router-link to="/notifications">
          <i class="bi bi-bell text-dark" style="font-size: 24px;"></i>
        </router-link>
      </div>
      <div class="text-center px-2">
        <router-link to="/settings">
          <i class="bi bi-gear text-dark" style="font-size: 24px;"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavbarMobile',
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
