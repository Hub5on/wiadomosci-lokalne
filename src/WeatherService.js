// Funkcja do pobierania danych pogodowych na podstawie nazwy lokalizacji
export async function fetchWeather(locationName) {
  try {
    const response = await fetch(`/api/get-weather?locationName=${locationName}`);
    if (!response.ok) {
      throw new Error('Nie udało się pobrać danych o pogodzie');
    }
    const data = await response.json();
    return {
      temp: parseFloat(data.temp).toFixed(1),
      description: data.description,
      icon: data.icon
    };
  } catch (error) {
    console.error('Błąd pobierania danych o pogodzie:', error);
    throw new Error(error.message || 'Nieznany błąd');
  }
}
