<template>
  <div class="content">
    <div class="categories">
      <button active-class="active" :class="{ active: selectedCategory === category }"
        v-for="category in categories"
        :key="category"
        @click="filterByCategory(category)"
      >
        {{ category }}
      </button>
    </div>
    <ul class="list-group list-group-flush p-3 one-article">
      <li class="list-group-item list-group-item-action article-item rounded-3" 
          v-for="article in visibleArticles"
          :key="article._id" 
          @mousedown="handleMouseDown(article, $event)" 
          style="cursor: pointer;">
        
        <img v-lazy="article.loadingImageUrl" alt="Loading Image" v-if="article.isLoading" class="loading-image">
        <div v-else-if="!article.isPageDeleted && !article.imageError">
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
              <p class="author"><strong>Autor:</strong> {{ article.creator }} {{ article.category }}</p>
            </div>
          </div>
          <h2 class="mb-3">{{ article.title }}</h2>
          <p>{{ article.description }}</p>
        </div>
      </li>
    </ul>

    <!-- Strażnik do ładowania kolejnych artykułów -->
    <div ref="scrollTrigger" class="scroll-trigger"></div>
  </div>
</template>


<script>
export default {
  name: 'ArticleList',
  data() {
    return {
      articles: [],
      visibleArticles: [],
      currentBatch: 0,
      batchSize: 5, // Liczba artykułów do załadowania na raz
      categories: ['Wszystkie', 'wydarzenie', 'ogłoszenie', 'informacja', 'inne'],
      selectedCategory: 'Wszystkie'
    };
  },
  created() {
    this.fetchArticles();
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    this.loadMoreArticles(); // Załaduj początkową partię artykułów
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
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

        // Po pobraniu artykułów, ładujemy pierwszą partię
        this.loadMoreArticles();
      } catch (error) {
        console.error('Błąd pobierania artykułów:', error);
      }
    },
    filterByCategory(category) {
  this.selectedCategory = category;
  this.currentBatch = 0;
  this.visibleArticles = []; // Resetuj widoczne artykuły

  // Wybieramy artykuły z wybranej kategorii
  if (category === 'Wszystkie') {
    this.loadMoreArticles(); // Ładuj wszystkie artykuły, jeśli wybrano "Wszystkie"
  } else {
    // Filtrowanie artykułów w zależności od wybranej kategorii
    const filteredArticles = this.articles.filter(article => article.category === category);
    this.visibleArticles = filteredArticles.slice(0, this.batchSize);
    this.currentBatch = Math.ceil(this.visibleArticles.length / this.batchSize);

    // Przetwarzanie zdjęć dla widocznych artykułów
    this.visibleArticles.forEach(article => this.processArticle(article));
  }
},

    handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Sprawdź, czy użytkownik zbliża się do końca strony
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        this.loadMoreArticles();
      }
    },

    loadMoreArticles() {
  const start = this.currentBatch * this.batchSize;
  const end = start + this.batchSize;

  let articlesToLoad = [];

  // Jeśli wybrano "Wszystkie" ładujemy wszystkie artykuły
  if (this.selectedCategory === 'Wszystkie') {
    articlesToLoad = this.articles.slice(start, end);
  } else {
    // Filtrowanie artykułów po wybranej kategorii
    const filteredArticles = this.articles.filter(article => article.category === this.selectedCategory);
    articlesToLoad = filteredArticles.slice(start, end);
  }

  if (articlesToLoad.length > 0) {
    this.visibleArticles.push(...articlesToLoad);
    this.currentBatch++;

    // Przetwarzanie zdjęć dla załadowanych artykułów
    articlesToLoad.forEach(article => this.processArticle(article));
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

        // Jeśli strona nie istnieje, próbujemy archiwalną wersję URL
        if (isPageDeleted) {
          const archivedLink = this.replaceLink(link);

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
        console.error('Błąd przy pobieraniu obrazka:', error);
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
      console.log('Redirecting to:', link);

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

    replaceLink(link) {
      if (link.includes('/aktualnosci2/aktualnosci')) {
        const archiveLink = link.replace('/aktualnosci2/aktualnosci', '/aktualnosci2/archiwum-aktualnosci');
        return archiveLink;
      }
      return link;
    }
  }
};
</script>


<style>
.categories {
  display: flex;
  gap: 1rem; /* Zmniejszamy odstęp między przyciskami */
  justify-content: center; /* Rozciąga przyciski na całej szerokości */
  background-color: white;
  padding: 0 1rem 10px 1rem; /* Zmniejszamy padding, aby kontener był węższy */
  flex-wrap: wrap; /* Pozwala na zawijanie przycisków w przypadku mniejszych ekranów */
  border-radius: 15px; /* Zaokrąglamy rogi kontenera */
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); /* Rozmycie krawędzi kontenera */
  width: 95%; /* Ustawiamy szerokość kontenera na 90% szerokości ekranu */
  max-width: 1200px; /* Maksymalna szerokość kontenera */
  margin: -10px auto auto auto; /* Wyśrodkowanie kontenera */
}

.categories button {
  position: relative; /* Niezbędne do prawidłowego pozycjonowania pseudo-elementu */
  padding: 0.5rem 2rem;
  background-color: white;
  color: black;
  border: none;
  cursor: pointer;
  margin-top: 1rem;
  text-decoration: none; /* Usuwamy domyślne podkreślenie */
  flex-shrink: 0; /* Zapewnia, że przyciski nie będą się kurczyć na małych ekranach */
}

.categories button::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 0;
  height: 2px; /* Grubość podkreślenia */
  background-color: transparent;
  transition: width 0.3s ease, left 0.3s ease, background-color 0.3s ease;
  transform: translateX(-50%);
}

/* Podkreślenie przy hover */
.categories button:hover::after {
  width: 50%; /* Podkreślenie zajmuje połowę szerokości przycisku */
  left: 50%;
  background-color: lightgray; /* Kolor podkreślenia */
}

/* Grubsze podkreślenie dla aktywnego przycisku */
.categories button.active::after {
  width: 50%;
  left: 50%;
  height: 3px; /* Grubsze podkreślenie dla aktywnego przycisku */
  background-color: #06354C; /* Niebieski kolor dla aktywnego przycisku */
}

/* Responsywność na ekranach o szerokości mniejszej niż 768px */
@media (max-width: 768px) {
  .categories {
    flex-direction: column; /* Zmienia układ na kolumnowy na mniejszych ekranach */
    width: 100%; /* Pełna szerokość dla małych ekranów */
    padding: 0.5rem; /* Zmniejszamy padding */
  }

  .categories button {
    width: 100%; /* Przyciski zajmują całą szerokość na małych ekranach */
    margin-bottom: 0.5rem; /* Dodajemy odstęp między przyciskami */
    padding: 0.5rem 1rem; /* Zmniejszamy padding przycisków */
    font-size: 1rem; /* Dostosowujemy rozmiar czcionki */
  }
}

@media (max-width: 576px) {
  .categories {
    width: 100%; /* Pełna szerokość dla jeszcze mniejszych ekranów */
    padding: 0.5rem; /* Zmniejszamy padding */
  }

  .categories button {
    padding: 0.5rem 1rem; /* Zmniejszamy padding przycisków na małych ekranach */
    font-size: 0.9rem; /* Zmniejszamy rozmiar czcionki na mniejszych ekranach */
  }
}


.scroll-trigger {
  height: 2px;
  width: 100%;
  background-color: transparent;
}

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
}

.img-square-or-tall {
  object-fit: contain;
  max-height: 30rem;
}

.img-wide {
  object-fit: contain;
  max-height: 30rem;
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
}

.error-image {
  width: 50%;
  height: auto;
  max-height: 25rem;
}
</style>
