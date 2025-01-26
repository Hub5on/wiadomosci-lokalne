const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      new (require('webpack')).DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false) // lub true, jeśli chcesz szczegóły
      }),
    ],
  },
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
    workboxOptions: {
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.(?:js|css|html)$/, // Cache'owanie plików statycznych
          handler: 'StaleWhileRevalidate',
        },
        {
          urlPattern: /^https:\/\/.*\/api\/.*$/, // Cache'owanie dynamicznych zapytań API
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 1 tydzień
            },
          },
        },
        {
          urlPattern: /.*/, // Cache wszystkiego innego jako fallback
          handler: 'StaleWhileRevalidate',
        },
      ],
      skipWaiting: true,
      clientsClaim: true,
    },
  },
});
