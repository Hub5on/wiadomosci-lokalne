<template>
  <div>
    <div class="categories-wrapper-mobile">
      <!-- Stały przycisk "Wszystkie" -->
      <button
        active-class="active"
        :class="{ active: selectedCategory === 'Wszystkie' }"
        @click="filterByCategory('Wszystkie')"
        class="static-category"
      >
        Wszystkie
      </button>

      <!-- Przewijalne przyciski pozostałych kategorii -->
      <div class="categories-mobile">
        <button
          active-class="active"
          :class="{ active: selectedCategory === category }"
          v-for="category in categories.filter((c) => c !== 'Wszystkie')"
          :key="category"
          @click="filterByCategory(category)"
        >
          {{ capitalize(category) }}
        </button>
      </div>
    </div>
    <ul class="list-group list-group-flush p-3">
      <li
        class="list-group-item list-group-item-action article-item rounded-3"
        v-for="article in visibleArticles"
        :key="article._id"
        @mousedown="handleMouseDown(article, $event)"
        style="cursor: pointer"
      >
        <img
          v-lazy="article.loadingImageUrl"
          alt="Loading Image"
          v-if="article.isLoading"
          class="loading-image"
        />
        <div v-else-if="!article.isPageDeleted && !article.imageError">
          <img
            v-lazy="article.imageUrl"
            alt="Article Image"
            :class="article.imageClass"
          />
        </div>
        <div v-else class="no-image-warning">
          <img
            v-lazy="'/img/error.png'"
            alt="Error Image"
            class="error-image"
          />
          <span class="text-danger"><strong>Strona usunięta</strong></span>
        </div>
        <div class="article-text p-3">
          <div class="row">
            <div class="col-md-6">
              <p class="pub-date-mobile">
                <strong>Data publikacji:</strong>
                {{ formatDateTime(article.pubDate) }}
              </p>
              <p class="author-mobile">
                <strong>Autor:</strong> {{ article.creator }}
              </p>
            </div>
          </div>
          <h2 class="mb-3">{{ article.title }}</h2>
          <p>{{ article.description }}</p>
        </div>
      </li>
    </ul>
    <!-- Trigger do lazy loadingu -->
    <div ref="scrollTrigger" class="scroll-trigger"></div>
  </div>
</template>

<script>
export default {
  name: "ArticleList",
  data() {
    return {
      articles: [],
      visibleArticles: [],
      currentBatch: 0,
      batchSize: 5, // Liczba artykułów do załadowania na raz
      categories: [
        "Wszystkie",
        "wydarzenie",
        "ogłoszenie",
        "informacja",
        "inne",
      ],
      selectedCategory: "Wszystkie",
      showScrollHint: true,
    };
  },
  created() {
    this.fetchArticles();
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
    this.loadMoreArticles();

    const categoriesMobile = document.querySelector(".categories-mobile");
    if (categoriesMobile) {
      categoriesMobile.classList.add("hint-scroll");
      setTimeout(() => {
        categoriesMobile.classList.remove("hint-scroll");
      }, 1500);
    }
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    //Pobieranie artykułów przez API z bazy danych MongoDB
    async fetchArticles() {
      try {
        await this.scrapeRss();
        const response = await fetch(`${this.getBaseUrl()}/api/articles`);
        const data = await response.json();

        this.articles = data.sort((a, b) => {
          const dateComparison = new Date(b.pubDate) - new Date(a.pubDate);
          return dateComparison !== 0
            ? dateComparison
            : b.title.localeCompare(a.title);
        });

        // Po pobraniu artykułów, ładujemy pierwszą partię
        this.loadMoreArticles();
      } catch (error) {
        console.error("Błąd pobierania artykułów:", error);
      }
    },
    //Filtrowanie artykułów po kategorii
    filterByCategory(category) {
      this.selectedCategory = category;
      this.currentBatch = 0;
      this.visibleArticles = [];

      if (category === "Wszystkie") {
        this.loadMoreArticles();
      } else {
        const filteredArticles = this.articles.filter(
          (article) => article.category === category
        );
        this.visibleArticles = filteredArticles.slice(0, this.batchSize);
        this.currentBatch = Math.ceil(
          this.visibleArticles.length / this.batchSize
        );
        this.visibleArticles.forEach((article) => this.processArticle(article));
      }
    },
    //Obsługa zdarzenia scroll
    handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Sprawdź, czy użytkownik zbliża się do końca strony
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        this.loadMoreArticles();
      }
    },
    //Ładowanie kolejnych artykułów
    loadMoreArticles() {
      const start = this.currentBatch * this.batchSize;
      const end = start + this.batchSize;

      let articlesToLoad = [];

      // Jeśli wybrano "Wszystkie" ładujemy wszystkie artykuły
      if (this.selectedCategory === "Wszystkie") {
        articlesToLoad = this.articles.slice(start, end);
      } else {
        // Filtrowanie artykułów po wybranej kategorii
        const filteredArticles = this.articles.filter(
          (article) => article.category === this.selectedCategory
        );
        articlesToLoad = filteredArticles.slice(start, end);
      }

      if (articlesToLoad.length > 0) {
        this.visibleArticles.push(...articlesToLoad);
        this.currentBatch++;

        // Przetwarzanie zdjęć dla załadowanych artykułów
        articlesToLoad.forEach((article) => this.processArticle(article));
      }
    },
    //Przetwarzanie artykułu i sprawdzanie czy istnieje obrazek
    async processArticle(article) {
      article.loadingImageUrl = "/img/loading.gif";
      article.isLoading = true;

      const { imageUrl, isPageDeleted, originalLinkUsed } =
        await this.fetchFirstImage(article.link);
      const { url, className } = await this.processImage(imageUrl);

      if (isPageDeleted) {
        article.isPageDeleted = true;
        article.imageUrl = "/img/error.png";
        article.imageClass = "img-wide";
        article.imageError = true;
        article.redirectLink = originalLinkUsed;
      } else if (!url) {
        article.imageUrl = "/img/temp.jpg";
        article.imageClass = "img-wide";
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
    //Pobieranie obrazka z artykułu
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
            return this.extractImage(
              archiveHtml,
              originalLinkUsed,
              isPageDeleted
            );
          }
        } else {
          return this.extractImage(html, originalLinkUsed, isPageDeleted);
        }

        return { imageUrl: "", isPageDeleted: true, originalLinkUsed };
      } catch (error) {
        console.error("Błąd przy pobieraniu obrazka:", error);
        return { imageUrl: "", isPageDeleted: true, originalLinkUsed: "" };
      }
    },
    //Pobieranie HTML z URL
    async fetchHtml(url) {
      const response = await fetch(
        `${this.getBaseUrl()}/api/proxy?url=${encodeURIComponent(url)}`
      );
      return response.text();
    },
    //Sprawdzanie czy strona nie istnieje
    isPageDeleted(html) {
      return (
        html.trim() === "<html><head></head><body></body></html>" ||
        html.trim() === ""
      );
    },
    //Wyciąganie obrazka z HTML
    extractImage(html, originalLinkUsed, isPageDeleted) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const imgElement = doc.querySelector(".container-subpage img");
      const imageUrl = imgElement ? imgElement.src : "";
      return { imageUrl, isPageDeleted, originalLinkUsed };
    },
    //Pobieranie danych RSS
    async scrapeRss() {
      try {
        const response = await fetch(`${this.getBaseUrl()}/api/scrape-rss`);
        if (!response.ok) {
          throw new Error("Nie udało się pobrać danych RSS");
        }
        const result = await response.json();
        console.log("Dane RSS:", result);
      } catch (error) {
        console.error("Błąd pobierania danych RSS:", error);
      }
    },
    //Pobieranie bazowego URL
    getBaseUrl() {
      return window.location.origin;
    },

    // Przetwarza obraz, zwraca URL i odpowiednią klasę CSS na podstawie proporcji obrazu lub błędu ładowania
    async processImage(imageUrl) {
      if (!imageUrl) return { url: "", className: "" };
      const replacedUrl = this.replaceLocalhostWithDomain(imageUrl);

      const img = new Image();
      img.src = replacedUrl;

      return new Promise((resolve) => {
        img.onload = () => {
          const className =
            img.width === img.height || img.height > img.width
              ? "img-square-or-tall"
              : "img-wide";
          resolve({ url: replacedUrl, className });
        };
        img.onerror = () => {
          console.error("Error loading image:", replacedUrl);
          resolve({ url: "", className: "img-error" });
        };
      });
    },
    // Zamienia localhost na domenę (dla celów lokalnych - development)
    replaceLocalhostWithDomain(url) {
      const targetDomain = "powiatsredzki.pl";
      let newUrl = url.includes(window.location.hostname)
        ? url.replace(window.location.hostname, targetDomain)
        : url;

      const urlObj = new URL(newUrl);
      urlObj.port = "";

      return urlObj.toString();
    },
    //Obsługa kliknięcia na artykuł
    handleMouseDown(article, event) {
      const link = article.redirectLink;
      console.log("Redirecting to:", link);

      if (event.button === 0) {
        window.location.href = link;
      } else if (event.button === 1) {
        window.open(link, "_blank");
        event.preventDefault();
      }
    },
    //Formatowanie daty i czasu
    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      const formattedDate = `${this.addZeroIfNeeded(
        date.getDate()
      )}/${this.addZeroIfNeeded(date.getMonth() + 1)}/${date.getFullYear()}`;
      const formattedTime = `${this.addZeroIfNeeded(
        date.getHours()
      )}:${this.addZeroIfNeeded(date.getMinutes())}`;
      return `${formattedDate} ${formattedTime}`;
    },
    //Dodawanie zera do dni tygodnia i miesięcy (<10) - formatowanie
    addZeroIfNeeded(num) {
      return num < 10 ? "0" + num : num;
    },
    //Zamiana linku na archiwalny
    replaceLink(link) {
      if (link.includes("/aktualnosci2/aktualnosci")) {
        const archiveLink = link.replace(
          "/aktualnosci2/aktualnosci",
          "/aktualnosci2/archiwum-aktualnosci"
        );
        return archiveLink;
      }
      return link;
    },
    capitalize(text) {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
  },
};
</script>

<style>
.pub-date-mobile,
.author-mobile {
  font-size: 0.7rem;
  margin-top: -0.5rem;
}

.scroll-trigger {
  height: 1px;
}

@media (max-width: 768px) {
  .article-item img {
    max-height: 300px;
    width: 100%;
    object-fit: contain;
  }
}

.categories-wrapper-mobile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  white-space: nowrap;
  padding: 0.5rem 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.categories-wrapper-mobile::-webkit-scrollbar {
  display: none; /* Chrome, Safari i inne WebKit */
}

.static-category {
  flex-shrink: 0; /* Zapobiega skalowaniu przycisku */
  padding: 0.3rem 1rem;
  border: none;
  border-radius: 15px;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-left: 10px;
}

.static-category.active {
  background-color: #007bff;
  color: #fff;
}

.static-category:hover {
  background-color: #0056b3;
  color: #fff;
}

.categories-mobile {
  display: inline-flex;
  gap: 0.5rem;
  overflow-x: auto;
}

.categories-mobile button {
  display: inline-block;
  white-space: nowrap;
  padding: 0.3rem 1rem;
  border: none;
  border-radius: 15px;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.categories-mobile button:last-child {
  margin-right: 10px;
}

.categories-mobile button.active {
  background-color: #007bff;
  color: #fff;
}

.categories-mobile button:hover {
  background-color: #0056b3;
  color: #fff;
}

@keyframes hintScroll {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(0);
  }
}

.categories-mobile.hint-scroll {
  animation: hintScroll 1.5s ease-in-out;
}
</style>
