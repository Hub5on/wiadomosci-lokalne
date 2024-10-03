<template>
  <div class="content">
    <ul class="list-group list-group-flush p-3 one-article">
      <li
        class="list-group-item list-group-item-action article-item rounded-3"
        v-for="article in articles"
        :key="article._id"
        @mousedown="handleMouseDown(article, $event)"
        style="cursor: pointer;"
      >
        <!-- Placeholder podczas ładowania -->
        <img v-lazy="article.loadingImageUrl" alt="Loading Image" v-if="article.isLoading" class="loading-image">

        <!-- Obrazek artykułu lub placeholder albo komunikat o błędzie -->
        <img v-lazy="article.imageUrl" alt="Article Image" v-else-if="!article.isPageDeleted && !article.imageError" :class="article.imageClass">
        
        <!-- Komunikat o błędzie strony -->
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
        // Wywołanie funkcji scrapeRss przed pobraniem artykułów
        await this.scrapeRss();

        // Pobieranie artykułów
        const response = await fetch(`${this.getBaseUrl()}/api/articles`);
        const data = await response.json();
        this.articles = data.sort((a, b) => {
          const dateComparison = new Date(b.pubDate) - new Date(a.pubDate);
          if (dateComparison !== 0) {
            return dateComparison;
          }
          return b.title.localeCompare(a.title); // Odwrotne sortowanie po tytule
        });

        // Przetwarzanie obrazków
        await Promise.all(this.articles.map(async (article) => {
          article.loadingImageUrl = '/img/loading.gif'; // Placeholder image URL
          article.isLoading = true; // Flaga, że obrazek jest ładowany
          
          const { imageUrl, isPageDeleted, archivedLink } = await this.fetchFirstImage(article.link);
          const { url, className } = await this.processImage(imageUrl);

          if (isPageDeleted) {
            article.isPageDeleted = true;
            article.imageUrl = '/img/error.png';
            article.imageClass = 'img-wide';
            article.imageError = true;
            article.redirectLink = archivedLink || article.link; // Ustaw link archiwalny, jeśli dostępny
          } else if (!url) {
            // Brak obrazka, ustawiamy placeholder
            article.imageUrl = '/img/temp.jpg';
            article.imageClass = 'img-wide'; // Domyślna klasa dla placeholdera
            article.imageError = false;
            article.redirectLink = article.link; // Ustaw link do oryginalnej strony
          } else {
            // Poprawny obrazek, przypisujemy prawidłowy URL
            article.imageUrl = url;
            article.imageClass = className;
            article.imageError = false;
            article.redirectLink = article.link; // Ustaw link do oryginalnej strony
          }

          // Zakończenie ładowania obrazka
          article.isLoading = false;
        }));

      } catch (error) {
        console.error('Błąd pobierania artykułów:', error);
      }
    },

    async fetchFirstImage(link) {
  try {
    const response = await fetch(`${this.getBaseUrl()}/api/proxy?url=${encodeURIComponent(link)}`);
    let html = await response.text();

    let isPageDeleted = html.trim() === '<html><head></head><body></body></html>' || html.trim() === '';
    let archivedLink = '';

    if (isPageDeleted) {
      archivedLink = link.replace('/aktualnosci/', '/archiwum-aktualnosci/');
      const archiveResponse = await fetch(`${this.getBaseUrl()}/api/proxy?url=${encodeURIComponent(archivedLink)}`);
      html = await archiveResponse.text();
      isPageDeleted = html.trim() === '<html><head></head><body></body></html>' || html.trim() === '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const imgElement = doc.querySelector('.container-subpage img');

    if (imgElement) {
      return { imageUrl: imgElement.src, isPageDeleted, archivedLink };
    } else {
      return { imageUrl: '', isPageDeleted, archivedLink };
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    return { imageUrl: '', isPageDeleted: true, archivedLink: '' };
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

    handleMouseDown(article, event) {
  // Użyj URL archiwalnego, jeśli strona została usunięta
  const link = article.isPageDeleted ? article.redirectLink : article.link;

  if (event.button === 0) { // Lewy przycisk myszy
    window.location.href = link;
  } else if (event.button === 1) { // Środkowy przycisk myszy
    window.open(link, '_blank');
    event.preventDefault(); // Zapobiegaj domyślnemu zachowaniu
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
