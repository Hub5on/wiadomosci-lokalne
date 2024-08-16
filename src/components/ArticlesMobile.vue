<template>
  <div>
    <ul class="list-group list-group-flush p-3">
      <li
        class="list-group-item list-group-item-action article-item"
        v-for="article in articles"
        :key="article._id"
        @click="goToSource(article.link)"
        style="cursor: pointer;"
      >
        <!-- Placeholder podczas ładowania -->
        <img v-lazy="article.loadingImageUrl" alt="Loading Image" v-if="!article.imageUrl && !article.imageError" class="loading-image">
        <!-- Obrazek artykułu -->
        <img v-lazy="article.imageUrl" alt="Article Image" v-if="article.imageUrl" :class="article.imageClass">
        <!-- Komunikat o błędzie -->
        <div v-if="article.imageError" class="no-image-warning">
          <img v-lazy="'img/error.png'" alt="Error Image" class="error-image">
        </div>
        <div class="article-text p-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <p class="pub-date m-0">
              <strong>Data publikacji:</strong> {{ formatDateTime(article.pubDate) }}
              <!-- Czerwony napis jeśli brak zdjęcia -->
              <span v-if="article.imageError" class="text-danger"><strong>Strona usunięta</strong></span>
            </p>
            <p class="author m-0"><strong>Autor:</strong> {{ article.creator }}</p>
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
      articles: [],
      imageCache: new Map()
    };
  },
  created() {
    this.fetchArticles();
  },
  methods: {
    async fetchArticles() {
      try {
        const response = await fetch(`${this.getBaseUrl()}/api/articles`);
        const data = await response.json();
        this.articles = data.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Przetwarzanie obrazków
        await Promise.all(this.articles.map(async (article) => {
          article.loadingImageUrl = 'path/to/loading/image.jpg'; // Placeholder image URL
          const imageUrl = await this.fetchFirstImage(article.link);
          const { url, className } = await this.processImage(imageUrl);

          // Tylko jeśli obrazek jest poprawny, przypisz URL i klasę
          if (url) {
            article.imageUrl = this.replaceLocalhostWithDomain(url);
            article.imageClass = className;
            article.imageError = false;
          } else {
            // W przeciwnym razie ustaw URL i klasę jako puste
            article.imageUrl = '';
            article.imageClass = '';
            article.imageError = true;
          }
        }));

      } catch (error) {
        console.error('Błąd pobierania artykułów:', error);
      }
    },
    getBaseUrl() {
      return window.location.origin;
    },
    async fetchFirstImage(link) {
      if (this.imageCache.has(link)) {
        return this.imageCache.get(link);
      }

      try {
        const response = await fetch(`${this.getBaseUrl()}/api/proxy?url=${encodeURIComponent(link)}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const imgElement = doc.querySelector('.container-subpage img');

        if (imgElement) {
          const imageUrl = imgElement.src;
          this.imageCache.set(link, imageUrl);
          return imageUrl;
        } else {
          console.warn('No image found for URL:', link);
          return '';
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        return '';
      }
    },
    async processImage(imageUrl) {
      if (!imageUrl) return { url: '', className: '' };

      return new Promise((resolve) => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          let className = '';

          if (width === height || height > width) {
            className = 'img-square-or-tall';
          } else {
            className = 'img-wide';
          }

          resolve({ url: imageUrl, className });
        };
        img.onerror = () => {
          resolve({ url: imageUrl, className: 'img-error' });
        };
      });
    },
    replaceLocalhostWithDomain(url) {
      const newDomain = 'powiatsredzki.pl';
      const urlObj = new URL(url);
      urlObj.hostname = newDomain;
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
    }
  }
};
</script>

<style>
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
  .author, .pub-date {
    font-size: 1rem;
  }
  @media (max-width: 576px) {
    .pub-date, .author {
      font-size: 0.8rem;
    }
  }
</style>
