<template>
    <div class="container mt-4">
      <div class="row">
        <div
          class="col-12 col-md-6 col-lg-4 mb-4"
          v-for="notification in notifications"
          :key="notification.title"
        >
          <div
            class="card h-100 shadow-sm"
            @click="handleNotificationClick(notification)"
            style="cursor: pointer"
          >
            <div class="card-body">
              <h5 class="card-title text-primary">{{ notification.title }}</h5>
              <p class="card-text text-muted">
                Dodano: {{ new Date(notification.pubDate).toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        notifications: [],
      };
    },
    async mounted() {
      try {
        // Próbuj odczytać powiadomienia z localStorage
        const storedNotifications = localStorage.getItem('notifications');
        
        if (storedNotifications) {
          // Jeśli powiadomienia są zapisane w localStorage, użyj ich
          this.notifications = JSON.parse(storedNotifications);
          console.log("Załadowane powiadomienia z localStorage:", this.notifications);
        } else {
          // Jeśli nie ma powiadomień w localStorage, pobierz je z API
          const baseURL = window.location.origin;
          const response = await fetch(`${baseURL}/api/notifications`);
          this.notifications = await response.json();
          // Zapisz powiadomienia w localStorage
          localStorage.setItem('notifications', JSON.stringify(this.notifications));
          console.log("Załadowane powiadomienia z API:", this.notifications);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania powiadomień:", error);
      }
    },
    methods: {
      async handleNotificationClick(notification) {
        try {
          const selectedNotification = {
            title: notification.title,
            pubDate: notification.pubDate,
            articleId: notification.id,
          };
  
          // Zapisz dane wybranego powiadomienia w localStorage
          localStorage.setItem('selectedNotification', JSON.stringify(selectedNotification));
  
          // Przekierowanie na stronę główną
          window.location.href = `${window.location.origin}/#article-${selectedNotification.articleId}`;
  
          // Opóźnienie przewinięcia do artykułu
          setTimeout(() => {
            this.scrollToArticle(selectedNotification.articleId);
          }, 1000);
        } catch (error) {
          console.error("Błąd podczas obsługi kliknięcia powiadomienia:", error);
        }
      },
  
      // Funkcja do przewijania do odpowiedniego artykułu
      scrollToArticle(articleId) {
        const targetArticle = document.getElementById(articleId);
  
        if (targetArticle) {
          targetArticle.scrollIntoView({ behavior: "smooth" });
        } else {
          console.error("Artykuł o podanym ID nie istnieje.");
        }
      },
    },
  };
  </script>
  
  <style>
  /* Opcjonalny styl, aby karty były bardziej estetyczne */
  .card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  </style>
  