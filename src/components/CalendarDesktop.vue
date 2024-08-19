<template>
  <div class="container-parent">
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
.container-parent {
  background-color: #f0f0f0; 
  padding: 5px 0 0 0; 
  min-height: 92vh; 
}

.calendar-container {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  background-color: #fff; 
  font-family: 'Lato', sans-serif;
  border-radius: 8px; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  overflow: hidden; 
  box-sizing: border-box; 
  min-height: 820px; 
}
</style>
