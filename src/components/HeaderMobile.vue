<template>
  <nav class="navbar navbar-light bg-info text-white">
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <!-- Dynamiczny tytuł na podstawie routingu -->
      <span class="navbar-brand mb-0 h1 p-1 text-white">{{ pageTitle }}</span>

      <!-- Kontener z informacjami o pogodzie -->
      <div v-if="weather" class="d-flex align-items-center justify-content-center">
        <span class="city-name me-2">{{ weather.city }}</span>
        <div class="weather-icon-wrapper">
          <img :src="weather.icon" alt="Ikona pogody" class="weather-icon">
        </div>
        <span class="temperature">{{ parseFloat(weather.temperature).toFixed(1) }}°C</span>
      </div>
      <div v-else class="loading-text">Ładowanie pogody...</div>
    </div>
  </nav>
</template>

<script>
import { fetchWeather } from '../WeatherService.js'; // Poprawnie zaimportowany fetchWeather

export default {
  name: 'HeaderMobile',
  data() {
    return {
      weather: null,
      pageTitle: 'Aktualności', // Domyślny tytuł
    };
  },
  mounted() {
    this.getWeather();
    this.updateTitle(); // Ustaw tytuł po zamontowaniu komponentu
    this.$router.afterEach(() => { // Reaguj na zmiany w routingu
      this.updateTitle();
    });
  },
  methods: {
    async getWeather() {
      // Pobierz lokalizację z ciasteczka
      const cookieCity = document.cookie
        .split('; ')
        .find(row => row.startsWith('selectedCity='))?.split('=')[1];

      let city = decodeURIComponent(cookieCity || '');

      if (!city) {
        try {
          const gpsLocation = await this.fetchGPSLocation(); // Uzyskaj lokalizację z GPS
          city = gpsLocation.city || 'Środa Wielkopolska';
        } catch (error) {
          console.error('Nie udało się pobrać lokalizacji GPS:', error);
          city = 'Środa Wielkopolska'; // Jeśli GPS zawiedzie, ustaw domyślne miasto
        }
      }

      try {
        const weatherData = await fetchWeather(city);

        if (weatherData) {
          if (city === 'Środa Wielkopolska') {
            city = 'Środa Wlkp.';
          }
          this.weather = {
            city: city,
            temperature: weatherData.temp,
            icon: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`,
          };
        }
      } catch (error) {
        console.error('Nie udało się pobrać danych pogodowych:', error);
      }
    },

    // Funkcja do pobierania lokalizacji GPS
    async fetchGPSLocation() {
      try {
        const { city } = await import('../LocationService.js').then(module => module.fetchCurrentLocation());
        return { city };
      } catch (error) {
        throw new Error('Błąd uzyskiwania lokalizacji GPS');
      }
    },

    // Funkcja do zmiany tytułu na podstawie trasy
    updateTitle() {
      const routeName = this.$route.name;
      if (routeName === 'HomePage') {
        this.pageTitle = 'Aktualności';
      } else if (routeName === 'CalendarPage') {
        this.pageTitle = 'Kalendarz';
      } else if (routeName === 'SettingsPage') {
        this.pageTitle = 'Ustawienia';
      } else {
        this.pageTitle = 'Aktualności';
      }
    }
  },
};
</script>

<style scoped>
.p-1 {
  padding: 1rem 0.5rem !important;
}

.weather-info {
  padding: 0 1rem 0 0.5rem;
}

.text-center {
  font-size: 0.9rem;
}
.weather-icon {
  width: 40px;
  height: 40px;

}

.weather-info span {
  margin-left: 8px;
  font-weight: bold;
}

.city-name {
  font-weight: bold;
  font-size: 0.8rem;
}


.temperature {
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 8px;
}

.loading-text {
  font-size: 0.9rem;

}
</style>
