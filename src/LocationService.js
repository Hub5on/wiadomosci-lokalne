export async function fetchCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pl`);
          const data = await response.json();
          resolve({
            name: data.city || data.locality || data.principalSubdivision
          });
        } catch (error) {
          console.error('Błąd pobierania lokalizacji:', error);
          reject(null);
        }
      }, (error) => {
        console.error('Błąd uzyskiwania współrzędnych GPS:', error);
        reject(null);
      });
    } else {
      console.error('Geolocation nie jest wspierane przez tę przeglądarkę.');
      reject(null);
    }
  });
}
