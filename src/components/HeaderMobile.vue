<template>
  <nav class="navbar navbar-light bg-info text-white">
    <div class="container-fluid">
      <span class="navbar-brand mb-0 h1 p-1 text-white">Aktualności</span>
      <div class="ml-auto d-flex flex-column">
        <div v-if="weatherData" class="weather-info d-flex align-items-center">
          <!-- Lokalizacja -->
          <div class="text-center mx-2">{{ currentLocation.name }}</div>
          <!-- Ikona pogody -->
          <div class="text-center mx-2">
            <img :src="`http://openweathermap.org/img/wn/${weatherData.icon}.png`" alt="Weather Icon">
          </div>
          <!-- Temperatura -->
          <div class="text-center mx-2">{{ formatTemperature(weatherData.temp) }}°C</div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { fetchWeather } from './/../WeatherService';
import { fetchCurrentLocation } from './/../LocationService';

export default {
  name: 'HeaderMobile',
  data() {
    return {
      weatherData: null,
      currentLocation: null
    };
  },
  async created() {
    try {
      const location = await fetchCurrentLocation();
      this.currentLocation = location;
      const weatherData = await fetchWeather(location.name);
      this.weatherData = weatherData;
    } catch (error) {
      console.error('Błąd:', error);
    }
  },
  methods: {
    formatTemperature(temperature) {
      return temperature.toFixed(1);
    }
  }
};
</script>

<style scoped>
.p-1 {
  padding: 1rem 0.5rem !important;
}
.weather-info {
  padding: 0 1rem 0 0.5rem;
}
</style>
