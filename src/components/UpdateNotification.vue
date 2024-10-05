<template>
  <div>
    <div
      v-if="showUpdate"
      class="alert alert-warning alert-dismissible fade show update-notification"
      role="alert"
      :style="{ bottom: notificationBottom }"
    >
      <p>Nowa wersja aplikacji jest dostępna. Odśwież, aby zaktualizować.</p>
      <button type="button" class="btn btn-light" @click="refreshApp">Odśwież</button>
      <button type="button" class="btn btn-secondary" @click="dismissUpdate">Kontynuuj offline</button>
      <button type="button" class="btn-close" aria-label="Close" @click="dismissUpdate"></button>
    </div>

    <div
      v-if="!isOnline"
      class="alert alert-danger alert-dismissible fade show offline-notification"
      role="alert"
      :style="{ bottom: notificationBottom }"
    >
      <p>Brak połączenia z internetem. Aplikacja działa w trybie offline.</p>
      <button type="button" class="btn btn-light" @click="retryConnection">Odśwież</button>
      <button type="button" class="btn btn-secondary" @click="dismissOffline">Kontynuuj offline</button>
      <button type="button" class="btn-close" aria-label="Close" @click="dismissOffline"></button>
    </div>

    <div
      v-if="isOnline && showOnlineAlert"
      class="alert alert-info alert-dismissible fade show online-notification"
      role="alert"
      :style="{ bottom: notificationBottom }"
    >
      <p>Połączenie z internetem zostało przywrócone. Odśwież, aby zobaczyć najnowsze zmiany.</p>
      <button type="button" class="btn btn-light" @click="refreshApp">Odśwież</button>
      <button type="button" class="btn-close" aria-label="Close" @click="dismissOnlineAlert"></button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showUpdate: false,
      isOnline: navigator.onLine,
      showOnlineAlert: false,
      registration: null,
      notificationBottom: '35px', // Domyślna wartość
    };
  },
  created() {
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
    document.addEventListener('swUpdated', this.handleSWUpdate, { once: true });
    window.addEventListener('resize', this.updateNotificationPosition); // Dodajemy nasłuchiwanie na resize
    this.updateNotificationPosition(); // Ustawiamy pozycję na początku
    window.addEventListener('beforeunload', this.handleBeforeUnload); // Dodajemy nasłuchiwanie na przed odświeżeniem
  },
  beforeUnmount() {
    // Usuwamy nasłuchiwanie, gdy komponent jest zniszczony
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
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
      } else {
        window.location.reload(); // Odśwież, jeśli nie ma nowej wersji
      }
    },
    dismissUpdate() {
      this.showUpdate = false;
    },
    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
      if (this.isOnline) {
        this.showOnlineAlert = true; 
      } else {
        this.showOnlineAlert = false; // Ukryj komunikat o powrocie online
      }
    },
    handleOnlineStatus() {
      this.updateOnlineStatus();
    },
    retryConnection() {
      window.location.reload();
    },
    dismissOffline() {
      this.isOnline = true; 
    },
    dismissOnlineAlert() {
      this.showOnlineAlert = false; 
    },
    updateNotificationPosition() {
      // Zmiana bottom w zależności od szerokości okna
      this.notificationBottom = window.innerWidth <= 768 ? '60px' : '35px';
    },
    handleBeforeUnload(event) {
      if (!this.isOnline) {
        // Zablokuj odświeżanie, jeśli aplikacja jest offline
        event.preventDefault();
        event.returnValue = ''; // Dla niektórych przeglądarek
      }
    },
  },
};
</script>

<style scoped>
.update-notification,
.offline-notification,
.online-notification {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1000; 
  margin: 0; 
}
</style>
