<template>
  <div id="app" class="container mt-5">
    <!-- Przełącznik między GPS a listą -->
    <div class="mb-3">
      <label for="location-source" class="form-label">Wybierz sposób pozyskania lokalizacji:</label>
      <select v-model="locationSource" id="location-source" class="form-select">
        <option value="gps">Lokalizacja GPS</option>
        <option value="list">Wybór z listy</option>
      </select>
    </div>

    <!-- Wyszukiwarka miast - tylko aktywna, gdy "list" jest wybrany -->
    <div v-if="locationSource === 'list'" class="mb-3">
      <label for="query" class="form-label">Lokalizacja:</label>
      <input
        type="text"
        v-model="query"
        @input="getLocationSuggestions"
        placeholder="Wpisz nazwę miasta lub lokalizacji..."
        class="form-control"
      />
      <ul v-if="filteredCities.length" class="list-group mt-3">
        <li
          v-for="(city, index) in filteredCities"
          :key="index"
          @click="selectCity(city)"
          class="list-group-item list-group-item-action"
        >
          {{ city.formatted }}
        </li>
      </ul>
      <button @click="saveCity" class="btn btn-primary w-100 mt-3">Zapisz</button>
    </div>

    <!-- Pokazanie lokalizacji z GPS - tylko aktywne, gdy "gps" jest wybrane -->
    <div v-if="locationSource === 'gps'" class="mb-3">
      <button @click="getGPSLocation" class="btn btn-primary w-100">Uzyskaj lokalizację GPS</button>
      <p v-if="gpsLocation" class="mt-3">Twoja lokalizacja: {{ gpsLocation }}</p>
      <button @click="saveCity" class="btn btn-success w-100 mt-3" v-if="gpsLocation">Zapisz lokalizację GPS</button>
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

      const apiKey = process.env.VUE_APP_GPS_API; // Wstaw swój klucz API
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
        const normalizedCity = locationToSave;
        document.cookie = `selectedCity=${encodeURIComponent(normalizedCity)}; path=/;`;
        alert(`Zapisano miasto: ${locationToSave}`);
      } else {
        alert('Nie wybrano lokalizacji. Wybierz lokalizację z listy lub z GPS.');
      }
      window.location.reload();
    },

    // Uzyskiwanie lokalizacji GPS
    async getGPSLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            // Użycie API do uzyskania nazwy miasta na podstawie współrzędnych GPS
            const apiKey = process.env.VUE_APP_GPS_API; // Wstaw swój klucz API
            const endpoint = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${apiKey}&language=pl&no_annotations=1`;

            try {
              const response = await fetch(endpoint);
              const data = await response.json();

              if (data.results && data.results.length) {
                // Uzyskanie nazwy miasta z odpowiedzi
                const city = data.results[0].components.city || data.results[0].components.town || data.results[0].components.village;
                this.gpsLocation = city ? city : 'Nieznana lokalizacja';
              } else {
                console.error('Nie udało się uzyskać pełnej lokalizacji');
                this.gpsLocation = 'Nieznana lokalizacja';
              }
            } catch (error) {
              console.error('Błąd podczas geokodowania:', error);
              this.gpsLocation = 'Nie udało się uzyskać lokalizacji';
            }
          },
          (error) => {
            console.error('Błąd uzyskiwania lokalizacji GPS:', error);
            this.gpsLocation = 'Nie udało się uzyskać lokalizacji';
          }
        );
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
  max-width: 500px;
  margin: auto;
}

/* Dostosowanie do urządzeń mobilnych */
.input-group {
  margin-bottom: 1rem;
}

.list-group-item {
  cursor: pointer;
}

.list-group-item:hover {
  background-color: #f1f1f1;
}

.btn {
  padding: 12px;
  font-size: 16px;
}

.form-select {
  padding: 0.5rem;
  font-size: 16px;
}

@media (max-width: 576px) {
  #app {
    padding: 15px;
  }

  .btn {
    padding: 10px;
    font-size: 14px;
  }

  .form-control,
  .form-select {
    font-size: 14px;
    padding: 0.75rem;
  }
}
</style>
