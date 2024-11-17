<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container-fluid">
      <router-link class="navbar-brand ms-5" to="/">
        <img src="/img/icons/favicon-32x32.png" alt="Logo" class="me-2">Wiadomości Lokalne
      </router-link>

      <!-- Przełącznik GPS / wybór miasta -->
      <div class="d-flex justify-content-center align-items-center">
        <label class="form-check-label me-2" for="useGps">Użyj GPS</label>
        <input 
          type="checkbox" 
          id="useGps" 
          v-model="useGps"
          @change="onLocationChange" 
        />
        <label class="form-check-label ms-2" for="useGps">Wybór miasta</label>
      </div>

      <!-- Wyswietlanie pogody w srodku -->
      <div class="weather-info mx-auto">
        <div v-if="weather" class="d-flex align-items-center justify-content-center">
          <img :src="weather.icon" alt="weather icon" class="weather-icon me-2">
          <span>{{ weather.city }}</span>
          <span>{{ weather.temperature }}°C</span>
        </div>
        <div v-else>Ładowanie pogody...</div>
      </div>

      <button
        class="navbar-toggler me-5"
        type="button"
        @click="isNavbarCollapsed = !isNavbarCollapsed"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="isNavbarCollapsed.toString()"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div :class="['collapse', 'navbar-collapse', { show: isNavbarCollapsed }]" id="navbarNavAltMarkup">
        <ul class="navbar-nav mx-auto justify-content-end me-5">
          <li class="nav-item">
            <router-link class="nav-link" to="/" exact-active-class="fw-bold active" active-class="fw-bold active">Aktualności</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/kalendarz" exact-active-class="fw-bold active" active-class="fw-bold active">Kalendarz</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/ustawienia" exact-active-class="fw-bold active" active-class="fw-bold active">Ustawienia</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { fetchWeather } from '..//WeatherService.js'; // Importujemy funkcję do pobierania pogody

export default {
  data() {
    return {
      isNavbarCollapsed: false,
      useGps: false,  // Zmienna do przełączania między GPS a wyborem miasta
      weather: null,  // Obiekt pogody
      city: ''  // Przechowuje miasto, które wybiera użytkownik
    };
  },
  mounted() {
    this.initializeLocation(); // Inicjalizujemy lokalizację przy ładowaniu strony
  },
  methods: {
    // Funkcja inicjalizująca lokalizację (z ciastka lub GPS)
    initializeLocation() {
      const savedCity = this.getCityFromCookie();
      if (savedCity) {
        this.city = savedCity; // Jeśli miasto jest zapisane w ciastku, ustawiamy je
        this.getWeather(savedCity);
      } else {
        this.getLocationFromGps(); // Jeśli brak miasta w ciastku, pobieramy GPS
      }
    },

    // Sprawdzamy, czy miasto jest zapisane w ciastku
    getCityFromCookie() {
      const match = document.cookie.match(/(^| )selectedCity=([^;]+)/);
      return match ? match[2] : null;
    },

    // Funkcja pobierania pogody
    async getWeather(city) {
      try {
        const weatherData = await fetchWeather(city);  // Funkcja pobierająca dane o pogodzie
        if (weatherData) {
          this.weather = {
            city: weatherData.city,
            temperature: weatherData.temp,
            icon: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`, // Link do ikony
          };
        } else {
          console.error('Błąd pobierania danych pogodowych');
        }
      } catch (error) {
        console.error('Błąd podczas pobierania pogody:', error);
      }
    },

    // Funkcja do pobierania lokalizacji z GPS
    getLocationFromGps() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pl`);
            const data = await response.json();
            this.city = data.city || data.locality || data.principalSubdivision || 'Nieznane miasto';
            this.getWeather(this.city); // Pobieramy pogodę na podstawie lokalizacji GPS
          } catch (error) {
            console.error('Błąd pobierania lokalizacji z GPS:', error);
          }
        });
      }
    },

    // Funkcja do przełączania między GPS a wyborem miasta
    onLocationChange() {
      if (this.useGps) {
        this.getLocationFromGps(); // Jeśli przełączamy na GPS, pobieramy lokalizację
      } else {
        this.city = ''; // Resetujemy miasto, gdy wracamy do ręcznego wyboru
        this.weather = null; // Resetujemy pogodę
      }
    },
  },
};
</script>

<style scoped>
.navbar-collapse {
  display: flex;
  justify-content: center;
}

.navbar-nav {
  display: flex; /* Zmieniamy na flex, aby elementy były obok siebie */
  flex-direction: row; /* Wyświetlamy elementy w wierszu */
  align-items: center; /* Wyrównanie w pionie */
  margin: 0; 
  padding: 0; 
}

.navbar-nav .nav-item {
  margin: 0 10px; /* Odstępy między elementami */
}

.nav-link {
  position: relative;
  text-decoration: none;
}

/* Podkreślenie szare przy hover z animacją od środka */
.nav-link::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 0;
  height: 2px;
  background-color: transparent;
  transition: width 0.3s ease, left 0.3s ease, background-color 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after {
  width: 50%;
  left: 50%;
  background-color: lightgray;
}

/* Grubsze podkreślenie niebieskie dla aktywnego linku z animacją od środka */
.nav-link.active::after {
  width: 50%; 
  left: 50%;
  height: 3px;
  background-color: #06354C;
}

.navbar {
  box-shadow: 0 4px 8px gray;
}

.navbar-brand {
  display: flex;
  align-items: center;
  height: 100%;
}

/* Stylizacja pogody */
.weather-info {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin: 0 auto;
}

.weather-icon {
  width: 30px;
  height: 30px;
}

.weather-info span {
  margin-left: 8px;
  font-weight: bold;
}
</style>
