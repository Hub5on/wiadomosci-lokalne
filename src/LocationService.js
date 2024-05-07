export async function fetchCurrentLocation() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      name: data.city
    };
  } catch (error) {
    console.error('Błąd pobierania lokalizacji:', error);
    return null;
  }
}
