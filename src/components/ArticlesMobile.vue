<template>
    <div>
      <ul class="list-group list-group-flush p-3">
        <li class="list-group-item list-group-item-action" v-for="article in articles" :key="article._id">
          <h2 class="mb-3">{{ article.title }}</h2>
          <p>{{ article.description }}</p>
          <p>Autor: {{ article.creator }}</p>
          <p>Data publikacji: {{ article.pubDate }}</p>
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
        const response = await fetch('/api/articles');
        const data = await response.json();
        // Sortowanie artykułów po dacie (od najnowszego do najstarszego)
        this.articles = data.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      } catch (error) {
        console.error('Błąd pobierania artykułów:', error);
      }
    }
  }
};
</script>

  