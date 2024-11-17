<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container-fluid">
      <router-link class="navbar-brand ms-5" to="/">
        <img src="/img/icons/favicon-32x32.png" alt="Logo" class="me-2">Wiadomości Lokalne
      </router-link>
      
      <!-- Wyswietlanie pogody w srodku -->
      <div class="weather-info mx-auto">
        <div v-if="weather" class="d-flex align-items-center">
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
import { fetchWeather } from '../WeatherService.js'; // importujemy Twoją funkcję do pobierania pogody

export default {
  data() {
    return {
      isNavbarCollapsed: false,
      weather: null, // Obiekt przechowujący dane o pogodzie
    };
  },
  mounted() {
    this.getWeather();
  },
  methods: {
    async getWeather() {
      const city = 'Warszawa'; // Możesz tu ustawić miasto, które chcesz wyświetlić domyślnie

      try {
        const weatherData = await fetchWeather(city); // Używamy Twojej funkcji do pobrania pogody
        
        if (weatherData) {
          this.weather = {
            city: weatherData.city,
            temperature: weatherData.temp,
            icon: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`, // Jeśli masz ikonę, możesz zmienić tę linijkę
          };
        } else {
          console.error('Błąd pobierania danych pogodowych');
        }
      } catch (error) {
        console.error('Błąd podczas pobierania pogody:', error);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0;
  padding: 0;
}

.navbar-nav .nav-item {
  margin: 5px 0;
}

.nav-link {
  position: relative;
  text-decoration: none;
}

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

.weather-info {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
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
