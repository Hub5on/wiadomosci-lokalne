const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: [
    'vuetify',
  ],
  devServer: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Adres Twojego serwera backendowego
        changeOrigin: true,
      },
    },
  },
  pwa: {
    name: 'Wiadomości Lokalne',
    short_name: 'Wiadomości Lokalne',
    description: 'Wiadomości Lokalne',
    display: 'standalone',
    lang: 'pl',
    orientation: 'portrait',
    themeColor: '#0dcaf0',  // Kolor paska narzędziowego Android i iOS
    msTileColor: '#0dcaf0', // Kolor kafelka Windows
    appleMobileWebAppCapable: 'yes',  // Umożliwia uruchamianie aplikacji w trybie offline
    appleMobileWebAppStatusBarStyle: 'black-translucent',  // Styl paska statusu na urządzeniach Apple
    icons: [
      {
        src: './img/icons/android-chrome-192x192.png',  // Upewnij się, że ta ścieżka jest poprawna
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: './img/icons/android-chrome-512x512.png',  // Upewnij się, że ta ścieżka jest poprawna
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: './img/icons/android-chrome-512x512.png',  // Możesz zmienić na inny obrazek
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: './img/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    manifestOptions: {
      start_url: '.', // Określenie URL startowego
      background_color: '#ffffff', // Kolor tła manifestu
    },
  },
});
