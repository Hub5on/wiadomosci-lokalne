export async function fetchWeather(locationName) {
  const WEATHER_API = process.env.WEATHER_API;
  console.log('ENV VARIABLES:', process.env);
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${locationName}&lang=pl&units=metric&appid=${WEATHER_API}`);
    const data = await response.json();
    return {
      temp: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Błąd pobierania danych o pogodzie:', error);
    return null;
  }
}
