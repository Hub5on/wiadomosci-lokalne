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
      }
    }
  },
  pwa: {
    manifestOptions: {
      name: 'Wiadomości Lokalne',
      short_name: 'Wiadomości Lokalne',
      description: 'Wiadomości Lokalne',
      display: 'standalone',
      lang: 'pl',
      orientation: 'portrait',
      backgroundColor: "#0dcaf0",
      icons: [
        {
          src: './img/icons/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
      ],
      screenshots: [
        {
          src: './img/icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          form_factor: 'wide'
        },
        {
          src: './img/icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        }
      ]
    }
  }
});
