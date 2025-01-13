<template>
  <div class="container">
    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import plLocale from "@fullcalendar/core/locales/pl";

export default {
  components: {
    FullCalendar,
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        dateClick: this.handleDateClick,
        eventClick: this.handleEventClick,
        events: [],
        headerToolbar: {
          left: "prev,next",
          center: "title",
          right: "today",
        },
        buttonText: {
          today: "Dzisiaj",
          month: "Miesiąc",
          week: "Tydzień",
          day: "Dzień",
        },
        locale: "pl",
        locales: [plLocale],
      },
      addedEvents: new Set(), // Zestaw do przechowywania już dodanych dat
    };
  },
  async created() {
    await this.fetchArticles();
  },
  methods: {
    async handleEventClick(info) {
      try {
        const response = await fetch(
          `/api/proxy?url=${encodeURIComponent(info.event.extendedProps.link)}`
        );
        const text = await response.text();

        if (
          (text.includes("<h1>Strona błędu</h1>") &&
            text.includes("Podany adres jest nieprawidłowy.")) ||
          text.trim() === ""
        ) {
          const newLink = info.event.extendedProps.link.replace(
            "/aktualnosci2/aktualnosci",
            "/aktualnosci2/archiwum-aktualnosci"
          );
          window.open(newLink, "_blank");
        } else {
          window.open(info.event.extendedProps.link, "_blank");
        }
      } catch (error) {
        console.error("Błąd podczas sprawdzania strony:", error);
        window.open(info.event.extendedProps.link, "_blank");
      }
    },
    async fetchArticles() {
      try {
        const response = await fetch("/api/articles");
        const articles = await response.json();
        const events = this.extractDatesFromArticles(articles);
        this.calendarOptions.events = events;
      } catch (error) {
        console.error("Błąd pobierania artykułów:", error);
      }
    },
    extractDatesFromArticles(articles) {
      const datePattern =
        /\b\d{1,2}\s(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\s\d{4}\b/g; // Pełne daty z rokiem
      const monthPattern =
        /\b\d{1,2}\s(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\b/g; // Daty bez roku
      const rangePattern =
        /\b(\d{1,2})\sdo\s(\d{1,2})\s(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\s(\d{4})\b/g; // Zakresy dat z rokiem
      const rangePatternWithoutYear =
        /\b(\d{1,2})\sdo\s(\d{1,2})\s(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\b/g; // Zakresy dat bez roku
      const yearPattern = /\b\d{4}\b/;
      const monthMap = {
        stycznia: "01",
        lutego: "02",
        marca: "03",
        kwietnia: "04",
        maja: "05",
        czerwca: "06",
        lipca: "07",
        sierpnia: "08",
        września: "09",
        października: "10",
        listopada: "11",
        grudnia: "12",
      };

      const events = [];

      articles.forEach((article) => {
        // Obsługuje pełne daty z rokiem, np. "19 marca 2025"
        const fullDateMatches =
          article.title.match(datePattern) ||
          article.description.match(datePattern);
        if (fullDateMatches) {
          fullDateMatches.forEach((match) => {
            const [day, monthName, year] = match.split(" ");
            const month = monthMap[monthName];
            const formattedDate = `${year}-${month}-${day.padStart(2, "0")}`;

            // Jeśli data już została dodana, pomijamy dodanie
            if (!this.addedEvents.has(formattedDate)) {
              events.push({
                title: article.title,
                start: formattedDate,
                link: article.link,
              });
              this.addedEvents.add(formattedDate);
            }
          });
        }

        // Obsługuje daty bez roku, np. "19 marca" (z rokiem z pubDate)
        const matchesWithoutYear =
          article.title.match(monthPattern) ||
          article.description.match(monthPattern);
        if (matchesWithoutYear) {
          matchesWithoutYear.forEach((match) => {
            const [day, monthName] = match.split(" ");
            const month = monthMap[monthName];
            let year = new Date(article.pubDate).getFullYear(); // Domyślnie używamy roku z pubDate

            // Sprawdzamy, czy w tytule lub opisie jest rok
            const yearMatch =
              article.title.match(yearPattern) ||
              article.description.match(yearPattern);
            if (yearMatch) {
              year = yearMatch[0];
            }

            const date = `${year}-${month}-${day.padStart(2, "0")}`;

            // Jeśli data już została dodana, pomijamy dodanie
            if (!this.addedEvents.has(date)) {
              events.push({
                title: article.title,
                start: date,
                link: article.link,
              });
              this.addedEvents.add(date);
            }
          });
        }

        // Obsługuje zakresy dat z rokiem, np. "16 do 30 września 2024"
        const rangeMatches =
          article.title.match(rangePattern) ||
          article.description.match(rangePattern);
        if (rangeMatches) {
          rangeMatches.forEach((match) => {
            const [startDay, endDay, monthName, year] = match.split(" ");
            const month = monthMap[monthName];
            const startDate = `${year}-${month}-${startDay.padStart(2, "0")}`;
            const endDate = `${year}-${month}-${endDay.padStart(2, "0")}`;

            let currentDate = new Date(startDate);
            const endDateObj = new Date(endDate);


            while (currentDate <= endDateObj) {
              const dateStr = currentDate.toISOString().split("T")[0]; // Formatuj datę na 'YYYY-MM-DD'


              if (!this.addedEvents.has(dateStr)) {
                events.push({
                  title: article.title,
                  start: dateStr,
                  link: article.link,
                });
                this.addedEvents.add(dateStr);
              }

              // Zwiększamy datę o jeden dzień
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });
        }

        // Obsługuje zakresy dat bez roku, np. "9 do 10 grudnia"
        const rangeMatchesWithoutYear =
          article.title.match(rangePatternWithoutYear) ||
          article.description.match(rangePatternWithoutYear);
        if (rangeMatchesWithoutYear) {
          rangeMatchesWithoutYear.forEach((match) => {
            const [startDay, endDay, monthName] = match.split(" ");
            const month = monthMap[monthName];
            let year = new Date(article.pubDate).getFullYear(); // Używamy roku z pubDate

            const startDate = `${year}-${month}-${startDay.padStart(2, "0")}`;
            const endDate = `${year}-${month}-${endDay.padStart(2, "0")}`;

            
            let currentDate = new Date(startDate);
            const endDateObj = new Date(endDate);

            
            while (currentDate <= endDateObj) {
              const dateStr = currentDate.toISOString().split("T")[0];

              
              if (!this.addedEvents.has(dateStr)) {
                events.push({
                  title: article.title,
                  start: dateStr,
                  link: article.link,
                });
                this.addedEvents.add(dateStr);
              }

              // Zwiększamy datę o jeden dzień
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });
        }
      });

      return events;
    },
  },
};
</script>

<style>
.calendar-container {
  margin: 0 auto;
  padding: 20px 10px 0 10px;
  max-width: 1000px;
  font-family: 'Lato', sans-serif;
  height: 600px;
}

.fc-daygrid-day-top {
  font-weight: bold;
}

.fc-daygrid-day-number {
  font-size: 1.2em;
}

.fc-daygrid-day-content {
  font-size: 0.9em;
}

.fc-toolbar-title {
  font-size: 1.5em;
  font-weight: 700;
}

.fc-button {
  font-size: 0.9em;
  border-radius: 4px;
}

.fc-button-primary {
  border: none;
  color: #fff;
}

.fc-button-primary:hover {
  background-color: #0056b3;
}

.fc-daygrid-day-number {
  color: #000;
  text-decoration: none;
}

.fc-daygrid-day-content {
  color: #000;
  text-decoration: none;
  display: none;
}

.fc-col-header-cell-cushion {
  text-decoration: none;
  color: #000;
}

.fc-daygrid-week-number {
  text-decoration: none;
}

</style>
