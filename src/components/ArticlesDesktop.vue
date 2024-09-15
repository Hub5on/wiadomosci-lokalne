<template>
  <div class="content">
    <ul class="list-group list-group-flush p-3 one-article">
      <li
        class="list-group-item list-group-item-action article-item rounded-3"
        v-for="article in articles"
        :key="article._id"
        @click="goToSource(article.link)"
        style="cursor: pointer;"
      >
        <!-- Placeholder podczas ładowania -->
        <img v-lazy="article.loadingImageUrl" alt="Loading Image" v-if="article.isLoading && !article.imageError && !article.isPageDeleted" class="loading-image">
        <!-- Obrazek artykułu lub placeholder -->
        <img v-lazy="article.imageUrl" alt="Article Image" v-if="!article.isPageDeleted && !article.imageError" :class="article.imageClass">
        <!-- Komunikat o błędzie strony -->
        <div v-if="article.isPageDeleted" class="no-image-warning">
          <img v-lazy="'/img/error.png'" alt="Error Image" class="error-image">
          <span class="text-danger"><strong>Strona usunięta</strong></span>
        </div>
        <div class="article-text p-3">
          <div class="row">
            <div class="col-md-6">
              <p class="pub-date">
                <strong>Data publikacji:</strong> {{ formatDateTime(article.pubDate) }}
              </p>
            </div>
            <div class="col-md-6">
              <p class="author"><strong>Autor:</strong> {{ article.creator }}</p>
            </div>
          </div>
          <h2 class="mb-3">{{ article.title }}</h2>
          <p>{{ article.description }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>



<script>
export default {
  name: 'ArticleList',
  data() {
    return {
      articles: []
    };
  },
  created() {
    this.fetchArticles();
  },
  methods: {
    async fetchArticles() {
      try {
        // Wywołanie funkcji scrapeRss przed pobraniem artykułów
        await this.scrapeRss();

        // Pobieranie artykułów
        const response = await fetch(`${this.getBaseUrl()}/api/articles`);
        const data = await response.json();
        this.articles = data.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Przetwarzanie obrazków
        await Promise.all(this.articles.map(async (article) => {
          article.loadingImageUrl = '/img/loading.gif'; // Placeholder image URL
          article.isLoading = true; // Flaga, że obrazek jest ładowany
          const { imageUrl, isPageDeleted } = await this.fetchFirstImage(article.link);
          const { url, className } = await this.processImage(imageUrl);

          // Tylko jeśli obrazek jest poprawny, przypisz URL i klasę
          if (isPageDeleted) {
            article.isPageDeleted = true;
            article.imageUrl = ''; // Resetujemy imageUrl, bo strona jest usunięta
            article.imageClass = '';
            article.imageError = true; // Ustawiamy na error
          } else if (!url) {
            // Brak obrazka, ustaw placeholder
            article.imageUrl = '/img/temp.png';
            article.imageClass = 'img-wide'; // Domyślna klasa dla placeholdera
            article.imageError = false; // Brak błędu, tylko placeholder
          } else {
            // Jest obrazek, przypisujemy prawidłowy URL
            article.imageUrl = url;
            article.imageClass = className;
            article.imageError = false;
          }

          // Przestań wyświetlać animację ładowania
          article.isLoading = false;
        }));

      } catch (error) {
        console.error('Błąd pobierania artykułów:', error);
      }
    },

    async fetchFirstImage(link) {
      try {
        const response = await fetch(`${this.getBaseUrl()}/api/proxy?url=${encodeURIComponent(link)}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Sprawdzenie, czy na stronie znajduje się komunikat o błędzie
        const isPageDeleted = !!doc.querySelector('.text-wrapper h1')?.textContent.includes('Strona błędu') ||
                              !!doc.body.textContent.includes('Podany adres jest nieprawidłowy');

        // Pobranie obrazka
        const imgElement = doc.querySelector('.container-subpage img');

        if (imgElement) {
          return { imageUrl: imgElement.src, isPageDeleted };
        } else {
          return { imageUrl: '', isPageDeleted };
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        return { imageUrl: '', isPageDeleted: false };
      }
    },

    async scrapeRss() {
      try {
        const response = await fetch(`${this.getBaseUrl()}/api/scrape-rss`);
        if (!response.ok) {
          throw new Error('Nie udało się pobrać danych RSS');
        }
        const result = await response.json();
        console.log('Dane RSS:', result);
      } catch (error) {
        console.error('Błąd pobierania danych RSS:', error);
      }
    },

    getBaseUrl() {
      return window.location.origin;
    },

    async processImage(imageUrl) {
      if (!imageUrl) return { url: '', className: '' };
      const replacedUrl = this.replaceLocalhostWithDomain(imageUrl);

      return new Promise((resolve) => {
        const img = new Image();
        img.src = replacedUrl;
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          let className = '';

          if (width === height || height > width) {
            className = 'img-square-or-tall';
          } else {
            className = 'img-wide';
          }

          resolve({ url: replacedUrl, className });
        };
        img.onerror = () => {
          console.error('Error loading image:', replacedUrl);
          resolve({ url: '', className: 'img-error' });
        };
      });
    },

    replaceLocalhostWithDomain(url) {
      const targetDomain = 'powiatsredzki.pl';
      let newUrl = url;
      if (url.includes(window.location.hostname)) {
        newUrl = url.replace(window.location.hostname, targetDomain);
      }

      const urlObj = new URL(newUrl);

      // Usuń port, jeśli istnieje
      urlObj.port = '';

      return urlObj.toString();
    },

    goToSource(link) {
      window.location.href = link;
    },

    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      const formattedDate = `${this.addZeroIfNeeded(date.getDate())}/${this.addZeroIfNeeded(date.getMonth() + 1)}/${date.getFullYear()}`;
      const formattedTime = `${this.addZeroIfNeeded(date.getHours())}:${this.addZeroIfNeeded(date.getMinutes())}`;
      return `${formattedDate} ${formattedTime}`;
    },

    addZeroIfNeeded(num) {
      return num < 10 ? '0' + num : num;
    },
  }
};
</script>



<style>
  .content {
    padding: 0 25%;
    background-color: #f0f0f0;
  }
  .one-article li {
    padding-top: 15px;
    margin-bottom: 25px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    border-radius: 15px;
    overflow: hidden;
  }
  .article-item img {
    width: 100%;
    height: auto;
    max-height: 30rem;
    object-fit: contain; /* Zmienione na contain */
    background-color: #ffffff; /* Dodane tło dla pustych przestrzeni */
  }
  .img-square-or-tall {
    object-fit: contain; /* Zmienione na contain */
    max-height: 30rem;
    background-color: #ffffff; /* Dodane tło dla pustych przestrzeni */
  }
  .img-wide {
    object-fit: contain; /* Zmienione na contain */
    max-height: 30rem;
    background-color: #ffffff; /* Dodane tło dla pustych przestrzeni */
  }
  .article-text {
    padding: 5%;
  }
  .author {
    text-align: right;
  }
  .author, .pub-date {
    font-size: 1rem;
  }
  @media (max-width: 576px) {
    .pub-date, .author {
      font-size: 0.8rem;
    }
  }
  .no-image-warning {
    color: red;
    font-weight: bold;
    text-align: center;
    padding: 10px 0;
  }
  .loading-image {
    width: 100%;
    height: auto;
    max-height: 30rem;
    object-fit: contain;
    background-color: #ffffff; /* Dodane tło dla pustych przestrzeni */
  }
  .error-image {
    width: 50%;
    height: auto;
    max-height: 25rem;
    object-fit: contain;
    background-color: #ffffff; /* Dodane tło dla pustych przestrzeni */
  }
</style>