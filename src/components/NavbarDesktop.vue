<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <div class="container">
      <router-link class="navbar-brand" to="/">Wiadomości Lokalne</router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/" exact-active-class="fw-bold" active-class="fw-bold">Aktualności</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/calendar" exact-active-class="fw-bold" active-class="fw-bold">Kalendarz</router-link>
          </li>
          <li class="nav-item">
            <!--<router-link class="nav-link" to="/powiadomienia">Powiadomienia</router-link>-->
          </li>
          <li class="nav-item">
            <!--<router-link class="nav-link" to="/ustawienia">Ustawienia</router-link>-->
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavbarDesktop'
}
</script>

<style>
.nav-link {
  margin-right: 15px;
  text-decoration: none;
  color: #fff;
}

.nav-link.router-link-active,
.nav-link.fw-bold {
  font-weight: bold;
}
</style>
