export async function fetchCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locationData = await fetchLocationData(position.coords.latitude, position.coords.longitude);
            resolve(locationData);
          } catch (error) {
            console.error('Błąd pobierania lokalizacji:', error);
            reject(error.message || 'Nieznany błąd');
          }
        },
        (error) => {
          console.error('Błąd uzyskiwania współrzędnych GPS:', error);
          reject('Błąd uzyskiwania współrzędnych GPS');
        }
      );
    } else {
      console.error('Geolocation nie jest wspierane przez tę przeglądarkę.');
      reject('Geolocation nie jest wspierane przez tę przeglądarkę');
    }
  });
}

async function fetchLocationData(latitude, longitude) {
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pl`);
  if (!response.ok) {
    throw new Error('Nie udało się pobrać lokalizacji');
  }
  const data = await response.json();
  return {
    city: data.city || data.locality || data.principalSubdivision,
    region: data.principalSubdivision || '',
    country: data.countryName || ''
  };
}
