<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div class="container">
        <a class="navbar-brand" href="#">Wiadomości Lokalne</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul class="navbar-nav ml-auto">
            <li class="nav-item active">
              <a class="nav-link active fw-bold" href="/">Aktualności</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Kalendarz</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Powiadomienia</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Ustawienia</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'NavbarDesktop',
  }
  </script>
  
  <style scoped>
  /* Stylizacja specyficzna dla komponentu Navbar */
  </style>
  