<template>
  <div class="container mt-5">
    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import plLocale from '@fullcalendar/core/locales/pl'

export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        dateClick: this.handleDateClick,
        events: [
          { title: 'event 1', start: '2024-08-01', end: '2024-08-03' },
          { title: 'event 2', date: '2024-08-02' }
        ],
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: 'today'
        },
        buttonText: {
          today: 'Dzisiaj',
          month: 'Miesiąc',
          week: 'Tydzień',
          day: 'Dzień'
        },
        locale: 'pl',
        locales: [plLocale],
        /*weekNumbers: true,
          weekNumberFormat: {
          week: 'numeric'
        }*/
      }
    }
  },
  methods: {
    handleDateClick(arg) {
      alert('date click! ' + arg.dateStr)
    }
  }
}
</script>

<style>
.calendar-container {
  margin: 0 auto;
  padding: 30px 40px 0 40px;
  max-width: 1000px;
  font-family: 'Lato', sans-serif;
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
}

.fc-col-header-cell-cushion {
  text-decoration: none;
  color: #000;
}
.fc-daygrid-week-number{
  text-decoration: none;
}
</style>
