export async function fetchWeather(locationName) {
  try {
    const response = await fetch(`/api/get-weather?locationName=${locationName}`);
    const data = await response.json();
    return {
      temp: data.temp,
      description: data.description,
      icon: data.icon
    };
  } catch (error) {
    console.error('Błąd pobierania danych o pogodzie:', error);
    return null;
  }
}
