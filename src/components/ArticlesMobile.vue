<template>
  <div class="content">
    <ul class="list-group list-group-flush p-3 one-article">
      <li
        class="list-group-item list-group-item-action article-item"
        v-for="article in articles"
        :key="article._id"
        @click="goToSource(article.link)"
        style="cursor: pointer;"
      >
        <img :src="article.imageUrl" alt="Article Image" v-if="article.imageUrl" class="img-fluid">
        <div class="article-text p-3">
          <div class="row">
            <div class="col-md-6">
              <p class="pub-date"><strong>Data publikacji:</strong> {{ formatDateTime(article.pubDate) }}</p>
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
        const response = await fetch('http://localhost:3000/api/articles');
        const data = await response.json();
        this.articles = data.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        await Promise.all(this.articles.map(async (article) => {
          const imageUrl = await this.fetchFirstImage(article.link);
          article.imageUrl = this.replaceLocalhostWithDomain(imageUrl);
        }));
      } catch (error) {
        console.error('Błąd pobierania artykułów:', error);
      }
    },
    getBaseUrl() {
      return window.location.origin;
    },
    async fetchFirstImage(link) {
      try {
        const response = await fetch(`http://localhost:3000/api/proxy?url=${encodeURIComponent(link)}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const imgElement = doc.querySelector('.container-subpage img');

        if (imgElement) {
          return imgElement.src;
        } else {
          return '';
        }
      } catch (error) {
        console.error('Błąd pobierania obrazka:', error);
        return '';
      }
    },
    replaceLocalhostWithDomain(url) {
      const baseUrl = this.getBaseUrl();
      return url.replace(baseUrl, 'http://powiatsredzki.pl');
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
<style scoped>
  .content {
    margin-top: 40px;
    padding: 0 25%; /* Dostosuj padding dla responsywności */
    background-color: #f0f0f0;
    border-radius: 15px;
  }
  .one-article li {
    padding: 0;
    margin-bottom: 25px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    border-radius: 15px; /* Dodaj border-radius dla całego li */
    overflow: hidden; /* Upewnij się, że obrazki wypełniają zaokrąglone rogi */
  }
  .article-item img {
    width: 100%;
    height: auto;
    max-height: 20rem;
  }
  .article-item {
    border-radius: 15px; /* Zaokrąglij rogi kontenera .article-item */
  }
  
</style>