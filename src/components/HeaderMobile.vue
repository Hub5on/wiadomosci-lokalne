<template>
    <nav class="navbar navbar-light bg-info text-white">
      <div class="container-fluid">
        <span class="navbar-brand mb-0 h1 p-1 text-white">Aktualności</span>
        <div class="ml-auto d-flex flex-column">
          <div v-if="weatherData" class="weather-info">
            <div class="text-center">{{ currentLocation.name }}</div>
            <div class="text-center"><img :src="`http://openweathermap.org/img/wn/${weatherData.icon}.png`" alt="Weather Icon"></div>
            <div class="text-center">{{ formatTemperature(weatherData.temp) }}°C</div>
            <!--<div v-html="formatWeatherDescription(weatherData.description)"></div>-->
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
        currentLocationL: null
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
      },
      formatWeatherDescription(description) {
        return description.replace(/ /g, '<br>');
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
  