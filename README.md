# Wiadomości Lokalne

## Opis projektu

Wiadomości Lokalne to aplikacja webowa, która umożliwia użytkownikom przeglądanie lokalnych wiadomości, wydarzeń i ogłoszeń. Aplikacja jest zbudowana przy użyciu Vue.js, Express.js oraz MongoDB.

## Instalacja

1. Sklonuj repozytorium:
   ```sh
   git clone https://github.com/twoje-konto/wiadomosci-lokalne.git
   cd wiadomosci-lokalne
2. Zainstaluj zależności:
   ```sh
   npm install
3. Skonfiguruj plik .env na podstawie .env.example:
   ```sh
   cp .env.example .env
4. Uruchom aplikację w trybie deweloperskim:
   ```sh
   node ./api/index.js 
   npm run serve
## Struktura katalogów
  * api - zawiera backend aplikacji zbudowany przy użyciu Express.js
  * public - zawiera statyczne pliki publiczne
  * src - zawiera kod źródłowy aplikacji frontendowej
  * components/ - komponenty Vue.js
  * router/ - konfiguracja routingu
  * assets/ - zasoby statyczne
  * LocationService.js - usługa do pobierania lokalizacji użytkownika
  * WeatherService.js - usługa do pobierania danych pogodowych
  * registerServiceWorker.js - konfiguracja Service Workera
## Technologie
  * Vue.js
  * Vue Router
  * Vuex
  * Vuetify
  * Bootstrap
  * Express.js
  * MongoDB
  * RSS Parser
