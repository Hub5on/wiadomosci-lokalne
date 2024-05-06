const Parser = require('rss-parser');
const mongoose = require('mongoose');
const parser = new Parser();

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

(async () => {
    try {
      const feed = await parser.parseURL('https://www.powiatsredzki.pl/powiatsredzki/kanal-rss-ssi.xml');
  
      console.log('Dane artykułów:');
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
            description: item.contentSnippet, // Możesz użyć item.description, jeśli contentSnippet nie zawiera pełnych opisów
            pubDate: new Date(formattedDate),
            creator: creator // Użyj usuniętej spacji przed i po 'creator'
          });
  
          // Zapisz artykuł do bazy danych
          await newArticle.save();
          console.log('Zapisano artykuł:', newArticle.title);
        } else {
          console.log('Artykuł już istnieje w bazie danych:', existingArticle.title);
        }
      }
  
    } catch (err) {
      console.error('Błąd podczas pobierania danych:', err);
    }
  })();
  
