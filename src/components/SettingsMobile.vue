<template>
    <div id="app">
    <input type="text" v-model="query" @input="filterList" placeholder="Wpisz nazwę miasta..">
    <ul v-if="filteredCities.length">
      <li v-for="city in filteredCities" :key="city" @click="selectCity(city)">{{ city }}</li>
    </ul>
    <button @click="saveCity">Zapisz</button>
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
        document.cookie = `selectedCity=${this.selectedCity}; path=/;`;
        alert(`Zapisano miasto: ${this.selectedCity}`);
      } else {
        alert('Nie wybrano miasta');
      }
    }
  }
};
</script>

<style>
ul {
  list-style-type: none;
  padding-left: 0;
}

</style>