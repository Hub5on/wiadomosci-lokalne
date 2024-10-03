<template>
  <div class="content">
    <ul class="list-group list-group-flush p-3 one-article">
      <li class="list-group-item list-group-item-action article-item rounded-3" v-for="article in articles"
        :key="article._id" @mousedown="handleMouseDown(article, $event)" style="cursor: pointer;">
        <img v-lazy="article.loadingImageUrl" alt="Loading Image" v-if="article.isLoading" class="loading-image">
        <div v-if="!article.isPageDeleted && !article.imageError">
          <img v-lazy="article.imageUrl" alt="Article Image" :class="article.imageClass">
        </div>
        <div v-else class="no-image-warning">
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
        await this.scrapeRss();
        const response = await fetch(`${this.getBaseUrl()}/api/articles`);
        const data = await response.json();

        this.articles = data.sort((a, b) => {
          const dateComparison = new Date(b.pubDate) - new Date(a.pubDate);
          return dateComparison !== 0 ? dateComparison : b.title.localeCompare(a.title);
        });

        await Promise.all(this.articles.map(this.processArticle));
      } catch (error) {
        console.error('Błąd pobierania artykułów:', error);
      }
    },

    async processArticle(article) {
      article.loadingImageUrl = '/img/loading.gif';
      article.isLoading = true;

      const { imageUrl, isPageDeleted, originalLinkUsed } = await this.fetchFirstImage(article.link);
      const { url, className } = await this.processImage(imageUrl);

      if (isPageDeleted) {
        article.isPageDeleted = true;
        article.imageUrl = '/img/error.png';
        article.imageClass = 'img-wide';
        article.imageError = true;
        article.redirectLink = originalLinkUsed;
      } else if (!url) {
        article.imageUrl = '/img/temp.jpg';
        article.imageClass = 'img-wide';
        article.imageError = false;
        article.redirectLink = article.link;
      } else {
        article.imageUrl = url;
        article.imageClass = className;
        article.imageError = false;
        article.redirectLink = originalLinkUsed;
      }

      article.isLoading = false;
    },

    async fetchFirstImage(link) {
      try {
        const html = await this.fetchHtml(link);
        let isPageDeleted = this.isPageDeleted(html);
        let originalLinkUsed = link;

        if (isPageDeleted) {
          const archivedLink = link.replace('/aktualnosci/', '/archiwum-aktualnosci/');
          const archiveHtml = await this.fetchHtml(archivedLink);
          isPageDeleted = this.isPageDeleted(archiveHtml);

          if (!isPageDeleted) {
            originalLinkUsed = archivedLink;
            return this.extractImage(archiveHtml, originalLinkUsed, isPageDeleted);
          }
        } else {
          return this.extractImage(html, originalLinkUsed, isPageDeleted);
        }

        return { imageUrl: '', isPageDeleted: true, originalLinkUsed };
      } catch (error) {
        console.error('Error fetching image:', error);
        return { imageUrl: '', isPageDeleted: true, originalLinkUsed: '' };
      }
    },

    async fetchHtml(url) {
      const response = await fetch(`${this.getBaseUrl()}/api/proxy?url=${encodeURIComponent(url)}`);
      return response.text();
    },

    isPageDeleted(html) {
      return html.trim() === '<html><head></head><body></body></html>' || html.trim() === '';
    },

    extractImage(html, originalLinkUsed, isPageDeleted) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const imgElement = doc.querySelector('.container-subpage img');
      const imageUrl = imgElement ? imgElement.src : '';
      return { imageUrl, isPageDeleted, originalLinkUsed };
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

      const img = new Image();
      img.src = replacedUrl;

      return new Promise((resolve) => {
        img.onload = () => {
          const className = img.width === img.height || img.height > img.width ? 'img-square-or-tall' : 'img-wide';
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
      let newUrl = url.includes(window.location.hostname) ? url.replace(window.location.hostname, targetDomain) : url;

      const urlObj = new URL(newUrl);
      urlObj.port = '';

      return urlObj.toString();
    },

    handleMouseDown(article, event) {
      const link = article.redirectLink;
      console.log("Redirecting to:", link);

      if (event.button === 0) {
        window.location.href = link;
      } else if (event.button === 1) {
        window.open(link, '_blank');
        event.preventDefault();
      }
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
  /* Zmienione na contain */
  background-color: #ffffff;
  /* Dodane tło dla pustych przestrzeni */
}

.img-square-or-tall {
  object-fit: contain;
  /* Zmienione na contain */
  max-height: 30rem;
  background-color: #ffffff;
  /* Dodane tło dla pustych przestrzeni */
}

.img-wide {
  object-fit: contain;
  /* Zmienione na contain */
  max-height: 30rem;
  background-color: #ffffff;
  /* Dodane tło dla pustych przestrzeni */
}

.article-text {
  padding: 5%;
}

.author {
  text-align: right;
}

.author,
.pub-date {
  font-size: 1rem;
}

@media (max-width: 576px) {
  .pub-date,
  .author {
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
