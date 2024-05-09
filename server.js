const express = require('express');
const Parser = require('rss-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Połączenie z MongoDB
mongoose.connect('', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Model danych
const articleSchema = new mongoose.Schema({
  title: String,
  link: String,
  description: String,
  pubDate: Date,
  creator: String
});
const Article = mongoose.model('Article', articleSchema);

// Funkcja pomocnicza do dodawania zera do jednocyfrowych liczb
function addZeroIfNeeded(num) {
  return num < 10 ? '0' + num : num;
}

// Parser RSS
const parser = new Parser();

// Endpoint API do pobierania i zapisywania danych z RSS
app.get('/api/scrape-rss', async (req, res) => {
  try {
    const feed = await parser.parseURL('https://www.powiatsredzki.pl/powiatsredzki/kanal-rss-ssi.xml');
    console.log('Dane artykułów:');

    let newArticlesCount = 0; // Licznik nowych artykułów

    for (const item of feed.items) {
      const existingArticle = await Article.findOne({ link: item.link });

      if (!existingArticle) { // Sprawdź, czy artykuł już istnieje w bazie
        const pubDateParts = item.pubDate.split(' ');
        const day = addZeroIfNeeded(parseInt(pubDateParts[1], 10));
        const monthMap = {
          'sty': '01',
          'lut': '02',
          'mar': '03',
          'kwi': '04',
          'maj': '05',
          'cze': '06',
          'lip': '07',
          'sie': '08',
          'wrz': '09',
          'paź': '10',
          'lis': '11',
          'gru': '12'
        };
        const month = monthMap[pubDateParts[2]];
        const year = pubDateParts[3];
        const time = pubDateParts[4].split(':');
        const hour = time[0];
        const minute = time[1];
        const formattedDate = `${year}/${month}/${day} ${hour}:${minute}`;

        const creator = item.creator.trim(); // Usunięcie spacji przed i po treści 'creator'

        const newArticle = new Article({
          title: item.title,
          link: item.link,
          description: item.contentSnippet, 
          pubDate: new Date(formattedDate),
          creator: creator 
        });

        // Zapisz artykuł do bazy danych
        await newArticle.save();
        console.log('Zapisano artykuł:', newArticle.title);
        newArticlesCount++; 
      } else {
        console.log('Artykuł już istnieje w bazie danych:', existingArticle.title);
      }
    }

    // Sprawdź, czy dodano jakieś nowe artykuły
    if (newArticlesCount === 0) {
      console.log('Brak nowych artykułów do dodania.');
    }
    if (newArticlesCount > 0) {
      console.log(`Dodano ${newArticlesCount} nowych artykułów.`);
      process.exit();
    }

    res.json({ message: 'Dane z RSS zostały zaktualizowane' });
  } catch (error) {
    console.error('Błąd pobierania i zapisywania danych:', error);
    res.status(500).json({ message: 'Błąd pobierania i zapisywania danych' });
  }
});

// Endpoint zwracający wszystkie artykuły
app.get('/api/articles', async (req, res) => {
    try {
      const articles = await Article.find();
      res.json(articles);
    } catch (err) {
      console.error('Błąd podczas pobierania artykułów:', err);
      res.status(500).json({ message: 'Wystąpił błąd podczas pobierania artykułów' });
    }
  });
  
  // Endpoint zwracający pojedynczy artykuł na podstawie jego identyfikatora
  app.get('/api/article/:id', async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: 'Artykuł nie został znaleziony' });
      }
      res.json(article);
    } catch (err) {
      console.error('Błąd podczas pobierania artykułu:', err);
      res.status(500).json({ message: 'Wystąpił błąd podczas pobierania artykułu' });
    }
  });
  

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
