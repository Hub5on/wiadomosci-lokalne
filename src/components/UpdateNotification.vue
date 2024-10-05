<template>
    <div>
      <div v-if="showUpdate" class="update-notification">
        <p>Nowa wersja aplikacji jest dostępna. Odśwież, aby zaktualizować.</p>
        <button @click="refreshApp">Odśwież</button>
        <button @click="dismissUpdate">Kontynuuj offline</button>
      </div>
      <div v-if="!isOnline" class="offline-notification">
        <p>Brak połączenia z internetem. Aplikacja działa w trybie offline.</p>
        <button @click="retryConnection">Odśwież</button>
        <button @click="dismissOffline">Kontynuuj offline</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        showUpdate: false,
        isOnline: navigator.onLine,
        registration: null,
      };
    },
    created() {
      window.addEventListener('online', this.updateOnlineStatus);
      window.addEventListener('offline', this.updateOnlineStatus);
      document.addEventListener('swUpdated', this.handleSWUpdate, { once: true });
    },
    methods: {
      handleSWUpdate(event) {
        this.registration = event.detail;
        this.showUpdate = true;
      },
      refreshApp() {
        if (this.registration && this.registration.waiting) {
          this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      },
      dismissUpdate() {
        this.showUpdate = false;
      },
      updateOnlineStatus() {
        this.isOnline = navigator.onLine;
      },
      retryConnection() {
        window.location.reload();
      },
      dismissOffline() {
        this.isOnline = true; // Ukryj komunikat
      },
    },
  };
  </script>
  
  <style scoped>
  .update-notification,
  .offline-notification {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #f39c12;
    color: white;
    padding: 15px;
    text-align: center;
  }
  .update-notification button,
  .offline-notification button {
    margin: 5px;
    padding: 10px;
  }
  </style>
  