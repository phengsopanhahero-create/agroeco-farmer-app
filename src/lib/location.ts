export type LocationData = {
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
  error: string | null;
  loading: boolean;
};

// Responsibility: handle browser geolocation and reverse geocoding.

export async function getLocation(): Promise<LocationData> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        address: "Unknown",
        coordinates: null,
        error: "Geolocation not supported",
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await res.json();
        const address = `${data.city || "Unknown"}, ${
          data.countryName || "Unknown"
        }`;
        resolve({
          address,
          coordinates: { latitude, longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        resolve({
          address: "Unknown",
          coordinates: null,
          error: err.message,
          loading: false,
        });
      },
      // Telegram's in-app WebView (especially iOS) can fail to surface the
      // permission prompt at all, in which case neither callback above
      // ever fires. A timeout guarantees this promise still resolves.
      { timeout: 10000 }
    );
  });
}
