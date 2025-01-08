require('dotenv').config();
const express = require('express');
const Parser = require('rss-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});

// Połączenie z MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Połączono z MongoDB');
    })
    .catch(err => {
        console.error('Błąd połączenia z MongoDB:', err);
    });

// Model danych
const articleSchema = new mongoose.Schema({
  title: String,
  link: String,
  description: String,
  pubDate: Date,
  creator: String,
  category: String
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
      const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:00Z`; // ISO format

      const creator = item.creator.trim(); // Usunięcie spacji przed i po treści 'creator'
      const description = item.contentSnippet.trim(); // Usunięcie spacji przed i po treści 'description'
      const category = getCategory(item.title, description);
      
      // Sprawdź, czy artykuł o tym samym tytule, dacie publikacji, opisie i twórcy już istnieje
      const existingArticle = await Article.findOne({
        title: item.title,
        pubDate: new Date(formattedDate),
        description: description,
        creator: creator
      });

      if (!existingArticle) { // Sprawdź, czy artykuł już istnieje w bazie
        const newArticle = new Article({
          title: item.title,
          link: item.link,
          description: description,
          pubDate: new Date(formattedDate),
          creator: creator,
          category: category
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
    if (newArticlesCount > 0) {
      res.json({ message: `Dodano ${newArticlesCount} nowych artykułów.` });
    } else {
      res.json({ message: 'Brak nowych artykułów do dodania.' });
    }
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

app.get('/api/proxy', async (req, res) => {
  try {
    const url = req.query.url;

    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return res.send('');
      }
      return res.status(response.status).send(`Error: ${response.statusText}`);
    }

    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).send('An error occurred while fetching the resource');
  }
});

app.get('/api/get-weather', async (req, res) => {
  const WEATHER_API = process.env.WEATHER_API; // Access the API key securely on the server side
  const locationName = req.query.locationName;

  if (!locationName) {
    return res.status(400).json({ message: 'Location name is required' });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&lang=pl&units=metric&appid=${WEATHER_API}`
    );
    const data = await response.json();

    if (response.ok) {
      res.json({
        temp: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      });
    } else {
      res.status(response.status).json({ message: data.message || 'Failed to fetch weather data' });
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

// Funkcja do przypisywania kategorii
function getCategory(title, description) {
  const content = `${title} ${description}`.toLowerCase();

  // 1. Wydarzenie: data i godzina
  const eventPattern = /\b\d{1,2}\s(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\b.*\b(godz\.?|o\s)?\d{1,2}([:.]\d{2})?/;

  // 2. Ogłoszenie: godzina od-do lub data od-do
  const announcementPattern = /\bod\b.*(?:godz\.?\s?\d{1,2}([:.]\d{2})?\sdo\s|[0-9]{1,2}\s(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\b.*do\s)/;

  // 3. Informacja: tylko data
  const infoPattern = /\b\d{1,2}\s(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\b|\b\d{4}\b/;

  // 4. Sprawdzanie warunków
  if (eventPattern.test(content)) {
    return 'wydarzenie';
  } else if (announcementPattern.test(content)) {
    return 'ogłoszenie';
  } else if (infoPattern.test(content)) {
    return 'informacja';
  } else {
    return 'inne';
  }
}

// Endpoint testowy do wyświetlania kategorii w logach
app.get('/api/test-categories', async (req, res) => {
  try {
    const feed = await parser.parseURL('https://www.powiatsredzki.pl/powiatsredzki/kanal-rss-ssi.xml');
    console.log('--- TESTOWANIE PRZYPISYWANIA KATEGORII ---');

    for (const item of feed.items) {
      const title = item.title.trim();
      const description = item.contentSnippet.trim();
      const category = getCategory(title, description);

      // Wyświetlenie w logach
      console.log(`Tytuł: ${title}`);
      console.log(`Opis: ${description}`);
      console.log(`Kategoria: ${category}`);
      console.log('------------------------------------------');
    }

    res.json({ message: 'Testowanie zakończone - sprawdź logi serwera.' });
  } catch (error) {
    console.error('Błąd testowania kategorii:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas testowania kategorii' });
  }
});

// Endpoint do aktualizacji kategorii artykułów
/* app.get('/api/update-categories', async (req, res) => {
  try {
    // Znajdź artykuły, które nie mają kategorii (category === null, pusty lub brak kategorii)
    const articlesWithoutCategory = await Article.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: "" }
      ]
    });

    console.log(`Znaleziono ${articlesWithoutCategory.length} artykułów bez kategorii.`);

    let updatedCount = 0;

    // Iteruj przez artykuły i przypisuj kategorię
    for (const article of articlesWithoutCategory) {
      const title = article.title || '';
      const description = article.description || '';
      const category = getCategory(title, description); // Przypisz kategorię na podstawie tytułu i opisu

      // Zaktualizuj kategorię artykułu w bazie
      const result = await Article.updateOne(
        { _id: article._id }, // Szukamy artykułu po jego _id
        { $set: { category } } // Aktualizujemy kategorię
      );

      // Jeśli artykuł został zaktualizowany, zwiększ licznik
      if (result.modifiedCount > 0) {
        updatedCount++;
      }

      console.log(`Tytuł: ${title}`);
      console.log(`Kategoria: ${category}`);
      console.log('------------------------------------------');
    }

    // Zwróć odpowiedź z informacją o liczbie zaktualizowanych artykułów
    res.json({ message: `Zaktualizowano ${updatedCount} artykułów.` });
  } catch (error) {
    console.error('Błąd podczas aktualizacji kategorii:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji kategorii' });
  }
}); */



module.exports = app;