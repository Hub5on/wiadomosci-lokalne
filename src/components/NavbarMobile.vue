<template>
  <div class="navbar-mobile bg-light">
    <div class="d-flex justify-content-between align-items-center py-2 container-fluid">
      <div class="text-center mx-3">
        <a href="/">
          <i class="bi bi-house-door text-dark"></i>
        </a>
      </div>
      <div class="text-center mx-2">
        <a href="#">
          <i class="bi bi-calendar text-dark"></i>
        </a>
      </div>
      <div class="text-center mx-2">
        <a href="#">
          <i class="bi bi-bell text-dark"></i>
        </a>
      </div>
      <div class="text-center mx-3">
        <a href="#">
          <i class="bi bi-gear text-dark"></i>
        </a>
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
.bi {
  font-size: 24px;
}

.navbar-mobile {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: #ffffff;
  box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-mobile a {
  text-decoration: none;
}

.navbar-mobile .container-fluid {
  padding-left: 0;
  padding-right: 0;
}
</style>
