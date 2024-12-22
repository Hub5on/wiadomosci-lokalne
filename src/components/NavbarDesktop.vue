<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container-fluid">
      <router-link class="navbar-brand ms-5" to="/">
        <img src="/img/icons/favicon-32x32.png" alt="Logo" class="me-2">Wiadomości Lokalne
      </router-link>



      <button class="navbar-toggler me-5" type="button" @click="isNavbarCollapsed = !isNavbarCollapsed"
        aria-controls="navbarNavAltMarkup" aria-expanded="isNavbarCollapsed.toString()" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div :class="['collapse', 'navbar-collapse', { show: isNavbarCollapsed }]" id="navbarNavAltMarkup">
        <ul class="navbar-nav mx-auto justify-content-end me-5">
          <li class="nav-item">
            <router-link class="nav-link" to="/" exact-active-class="fw-bold active"
              active-class="fw-bold active">Aktualności</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/kalendarz" exact-active-class="fw-bold active"
              active-class="fw-bold active">Kalendarz</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/ustawienia" exact-active-class="fw-bold active"
              active-class="fw-bold active">Ustawienia</router-link>
          </li>
          <li class="nav-item weather-info mx-auto">
            <div v-if="weather" class="d-flex align-items-center justify-content-center">
              <span class="city-name me-2">{{ weather.city }}</span>
              <div class="weather-icon-wrapper">
                <img :src="weather.icon" alt="Ikona pogody" class="weather-icon">
              </div>
              <span class="temperature">{{ parseFloat(weather.temperature).toFixed(1) }}°C</span>
            </div>
            <div v-else class="loading-text">Ładowanie pogody...</div>
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
      // Pobierz lokalizację z ciasteczka
      const cookieCity = document.cookie
        .split('; ')
        .find(row => row.startsWith('selectedCity='))
        ?.split('=')[1];

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
          this.weather = {
            city: city,
            temperature: weatherData.temp,
            icon: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`,
          };
        } else {
          console.error('Błąd pobierania danych pogodowych');
        }
      } catch (error) {
        console.error('Błąd podczas pobierania pogody:', error);
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
  /* Zmieniamy na flex, aby elementy były obok siebie */
  flex-direction: row;
  /* Wyświetlamy elementy w wierszu */
  align-items: center;
  /* Wyrównanie w pionie */
  margin: 0;
  padding: 0;
}

.navbar-nav .nav-item {
  margin: 0 10px;
  /* Odstępy między elementami */
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

.weather-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #cecece; /* Jaśniejszy odcień szarości */
  border-radius: 50%; /* Delikatne zaokrąglenie */
  margin-right: 8px; /* Margines między ikoną a tekstem */
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
  font-size: 1rem;
}


.temperature {
  font-size: 1rem;
  font-weight: 500;
  color: #007bff;
}

.loading-text {
  font-size: 0.9rem;
  color: #666;
}
</style>
