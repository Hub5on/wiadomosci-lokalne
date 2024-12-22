<template>
  <div id="app">
    <!-- Przełącznik między GPS a listą -->
    <div>
      <label for="location-source">Wybierz sposób pozyskania lokalizacji:</label>
      <select v-model="locationSource" id="location-source">
        <option value="gps">Lokalizacja GPS</option>
        <option value="list">Wybór z listy</option>
      </select>
    </div>

    <!-- Wyszukiwarka miast - tylko aktywna, gdy "list" jest wybrany -->
    <div v-if="locationSource === 'list'">
      <input
        type="text"
        v-model="query"
        @input="getLocationSuggestions"
        placeholder="Wpisz nazwę miasta lub lokalizacji..."
      />
      <ul v-if="filteredCities.length" class="city-list">
        <li
          v-for="(city, index) in filteredCities"
          :key="index"
          @click="selectCity(city)"
          class="city-item"
        >
          {{ city.formatted }}
        </li>
      </ul>
      <button @click="saveCity" class="save-button">Zapisz</button>
    </div>

    <!-- Pokazanie lokalizacji z GPS - tylko aktywne, gdy "gps" jest wybrane -->
    <div v-if="locationSource === 'gps'">
      <button @click="getGPSLocation" class="save-button">Uzyskaj lokalizację GPS</button>
      <p v-if="gpsLocation">Twoja lokalizacja: {{ gpsLocation }}</p>
      <button @click="saveCity" class="save-button" v-if="gpsLocation">Zapisz lokalizację GPS</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: '',
      filteredCities: [],
      selectedCity: '',
      locationSource: 'gps', // domyślnie GPS
      gpsLocation: null, // Przechowywanie lokalizacji GPS
    };
  },
  methods: {
    // Pobieranie sugestii miast
    async getLocationSuggestions() {
      if (this.query.trim() === '') {
        this.filteredCities = [];
        return;
      }

      const apiKey = '46bb0281a415476fae5ca22fed3e4d75'; // Wstaw swój klucz API
      const endpoint = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        this.query
      )}&key=${apiKey}&language=pl&no_annotations=1`;

      try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results && data.results.length) {
          this.filteredCities = data.results.map(result => ({
            name: result.components.city || result.components.town || result.components.village,
            formatted: result.formatted, // Pełna lokalizacja (np. miasto, kod pocztowy, kraj)
            lat: result.geometry.lat,
            lng: result.geometry.lng,
          }));
        } else {
          this.filteredCities = [];
        }
      } catch (error) {
        console.error('Błąd pobierania lokalizacji:', error);
      }
    },

    // Wybór miasta z listy
    selectCity(city) {
      this.query = city.formatted; // Ustaw pełną lokalizację w polu wyszukiwania
      this.selectedCity = city;
      this.filteredCities = []; // Oczyść listę podpowiedzi po wyborze
    },

    // Zapisanie lokalizacji w ciastku
    saveCity() {
      let locationToSave = '';
      if (this.locationSource === 'gps' && this.gpsLocation) {
        locationToSave = this.gpsLocation;
      } else if (this.locationSource === 'list' && this.selectedCity) {
        locationToSave = this.selectedCity.name;
      }

      if (locationToSave) {
        // Zapisujemy tylko nazwę miasta (usuwając polskie znaki)
        const normalizedCity = this.removePolishChars(locationToSave);
        document.cookie = `selectedCity=${encodeURIComponent(normalizedCity)}; path=/;`;
        alert(`Zapisano miasto: ${locationToSave}`);
      } else {
        alert('Nie wybrano lokalizacji. Wybierz lokalizację z listy lub z GPS.');
      }
      window.location.reload();
    },

    // Funkcja do usuwania polskich znaków
    removePolishChars(str) {
      const polishChars = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
      };

      return str.split('').map(char => polishChars[char] || char).join('');
    },

    // Uzyskiwanie lokalizacji GPS
    getGPSLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          this.gpsLocation = `Lat: ${latitude}, Lon: ${longitude}`;
        }, (error) => {
          console.error('Błąd uzyskiwania lokalizacji GPS:', error);
          alert('Nie udało się uzyskać lokalizacji GPS.');
        });
      } else {
        alert('Geolokalizacja nie jest dostępna w tej przeglądarce.');
      }
    },
  },
};
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 400px;
  margin: auto;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 10px;
}

.city-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ddd;
  max-height: 150px;
  overflow-y: auto;
}

.city-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
}

.city-item:hover {
  background-color: #f0f0f0;
}

.save-button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 10px;
}

.save-button:hover {
  background-color: #0056b3;
}
</style>
