const Parser = require('rss-parser');
const mongoose = require('mongoose');
const parser = new Parser();

// Połączenie z MongoDB
mongoose.connect('mongodb+srv://Hub5on:svPFAAWueTHW5W4M@cluster0.p3vinnx.mongodb.net/wiadomosci-lokalne?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });
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
    
    // Sprawdź, czy są jakieś nowe artykuły
    if (feed.items.length === 0) {
      console.log('Brak nowych artykułów do dodania.');
      process.exit(); // Zakończ działanie skryptu, jeśli nie ma nowych artykułów
    }

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
          description: item.contentSnippet, // Możesz użyć item.description, jeśli contentSnippet nie zawiera pełnych opisów
          pubDate: new Date(formattedDate),
          creator: creator // Użyj usuniętej spacji przed i po 'creator'
        });

        // Zapisz artykuł do bazy danych
        await newArticle.save();
        console.log('Zapisano artykuł:', newArticle.title);
        newArticlesCount++; // Zwiększ licznik nowych artykułów
      } else {
        console.log('Artykuł już istnieje w bazie danych:', existingArticle.title);
      }
    }

    // Sprawdź, czy dodano jakieś nowe artykuły
    if (newArticlesCount === 0) {
      console.log('Brak nowych artykułów do dodania.');
      process.exit(); // Zakończ działanie skryptu, jeśli nie dodano nowych artykułów
    }

  } catch (err) {
    console.error('Błąd podczas pobierania danych:', err);
    process.exit(1); // Zakończ działanie skryptu z kodem błędu 1 w przypadku wystąpienia błędu
  }
})();

  
