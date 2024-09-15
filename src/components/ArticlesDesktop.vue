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
        <!-- Wyświetlanie loading.gif podczas ładowania -->
        <img v-lazy="article.loadingImageUrl" alt="Loading Image" v-if="article.isLoading" class="loading-image">

        <!-- Obrazek artykułu lub placeholder -->
        <img v-lazy="article.imageUrl" alt="Article Image" v-if="!article.isLoading && !article.imageError && !article.isPageDeleted" :class="article.imageClass">

        <!-- Komunikat o błędzie strony -->
        <div v-if="!article.isLoading && article.isPageDeleted" class="no-image-warning">
          <img v-lazy="'/img/error.png'" alt="Error Image" class="error-image">
          <span class="text-danger"><strong>Strona usunięta</strong></span>
        </div>

        <!-- Komunikat o braku obrazka (wstawiamy error.png zamiast zdjęcia) -->
        <img v-lazy="'/img/error.png'" alt="Error Image" v-if="!article.isLoading && article.imageError && !article.isPageDeleted" class="error-image">

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
          article.isLoading = true;
          article.loadingImageUrl = '/img/loading.gif'; // Placeholder image URL
          
          const pageContent = await this.fetchPageContent(article.link);

          if (this.isPageDeleted(pageContent)) {
            article.isPageDeleted = true;
            article.isLoading = false;
            article.imageError = true;
            article.imageUrl = '';
          } else {
            const imageUrl = await this.fetchFirstImage(pageContent);
            const { url, className } = await this.processImage(imageUrl);
            article.isLoading = false;

            if (url) {
              article.imageUrl = this.replaceLocalhostWithDomain(url);
              article.imageClass = className;
              article.imageError = false;
            } else {
              // Jeśli brak obrazka, wstaw temp.png
              article.imageUrl = '/img/temp.png';
              article.imageClass = '';
              article.imageError = false;
            }
          }
        }));

      } catch (error) {
        console.error('Błąd pobierania artykułów:', error);
      }
    },

    async fetchPageContent(link) {
      try {
        const response = await fetch(`${this.getBaseUrl()}/api/proxy?url=${encodeURIComponent(link)}`);
        return await response.text();
      } catch (error) {
        console.error('Błąd pobierania strony:', error);
        return '';
      }
    },

    isPageDeleted(pageContent) {
      // Sprawdzenie czy strona zawiera komunikat błędu
      return pageContent.includes('Podany adres jest nieprawidłowy');
    },

    async fetchFirstImage(pageContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, 'text/html');
      const imgElement = doc.querySelector('.container-subpage img');

      if (imgElement) {
        return imgElement.src;
      } else {
        return ''; // Brak obrazka na stronie
      }
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
          resolve({ url: replacedUrl, className: 'img-error' });
        };
      });
    },

    replaceLocalhostWithDomain(url) {
      const targetDomain = 'powiatsredzki.pl'; 
      let newUrl = url;
      if (url.includes(window.location.hostname)) {
        newUrl = url.replace(window.location.hostname, targetDomain);
      }

      // Tworzenie URL obiektu, aby manipulować jego elementami
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
    object-fit: contain;
    background-color: #ffffff;
  }
  .img-square-or-tall {
    object-fit: contain;
    max-height: 30rem;
    background-color: #ffffff;
  }
  .img-wide {
    object-fit: contain;
    max-height: 30rem;
    background-color: #ffffff;
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
    background-color: #ffffff;
  }
  .error-image {
    width: 50%;
    height: auto;
    max-height: 25rem;
    object-fit: contain;
    background-color: #ffffff;
  }
</style>
