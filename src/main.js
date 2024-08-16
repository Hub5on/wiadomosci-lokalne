import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import VueLazyload from 'vue-lazyload';


const app = createApp(App);


app.use(VueLazyload, {
  loading: '/img/loading.gif', 
  error: '/img/error.png' 
});

// Użyj routera
app.use(router);

// Zamontuj aplikację
app.mount('#app');
