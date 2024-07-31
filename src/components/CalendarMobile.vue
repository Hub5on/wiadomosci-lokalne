<template>
  <div class="container">
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
        height: 600,
        contentHeight: 600,
        fixedWeekCount: false 
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
