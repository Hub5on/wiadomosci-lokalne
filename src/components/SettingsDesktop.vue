<template>
  <div id="app">
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
        {{ city.name }}
      </li>
    </ul>
    <button @click="saveCity" class="save-button">Zapisz</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: '',
      filteredCities: [],
      selectedCity: '',
    };
  },
  methods: {
    async getLocationSuggestions() {
      if (this.query.trim() === '') {
        this.filteredCities = [];
        return;
      }

      const apiKey = 'YOUR_OPENCAGE_API_KEY'; // Wstaw swój klucz API
      const endpoint = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        this.query
      )}&key=${apiKey}&language=pl&no_annotations=1`;

      try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results && data.results.length) {
          this.filteredCities = data.results.map(result => ({
            name: result.components.city || result.components.town || result.components.village,
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
    selectCity(city) {
      this.query = city.name;
      this.selectedCity = city;
      this.filteredCities = [];
    },
    saveCity() {
      if (this.selectedCity) {
        const normalizedCity = this.removePolishChars(this.selectedCity.name);
        document.cookie = `selectedCity=${encodeURIComponent(normalizedCity)}; path=/;`;
        alert(`Zapisano miasto: ${this.selectedCity.name}`);
      } else {
        alert('Nie wybrano miasta. Wybierz miasto z listy.');
      }
    },
    // Funkcja do usuwania polskich znaków
    removePolishChars(str) {
      const polishChars = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
      };

      return str.split('').map(char => polishChars[char] || char).join('');
    }
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
