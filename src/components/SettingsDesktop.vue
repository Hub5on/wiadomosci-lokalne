<template>
  <div id="app">
    <input
      type="text"
      v-model="query"
      @input="filterList"
      placeholder="Wpisz nazwę miasta..."
    />
    <ul v-if="filteredCities.length" class="city-list">
      <li
        v-for="city in filteredCities"
        :key="city"
        @click="selectCity(city)"
        class="city-item"
      >
        {{ city }}
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
      cities: ['Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań'],
      filteredCities: [],
      selectedCity: ''
    };
  },
  methods: {
    filterList() {
      if (this.query.trim() === '') {
        this.filteredCities = [];
        return;
      }
      this.filteredCities = this.cities.filter(city =>
        city.toLowerCase().startsWith(this.query.toLowerCase())
      );
    },
    selectCity(city) {
      this.query = city;
      this.filteredCities = [];
      this.selectedCity = city;
    },
    saveCity() {
      if (this.selectedCity) {
        document.cookie = `selectedCity=${encodeURIComponent(this.selectedCity)}; path=/;`;
        alert(`Zapisano miasto: ${this.selectedCity}`);
      } else {
        alert('Nie wybrano miasta. Wybierz miasto z listy.');
      }
    }
  }
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
