const { defineConfig } = require('@vue/cli-service')
module.exports = {
  transpileDependencies: [
    'vuetify' 
  ],
  pwa:{
    manifestOptions: {
      name: 'Wiadomości Lokalne',
      short_name: 'Wiadomości Lokalne',
      description: 'Wiadomości Lokalne',
      display: 'standalone',
      lang: 'pl',
      orientation: 'portrait',
      icons:[
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
          "form_factor": "wide"
        },
        {
          src: './img/icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        }
      ]
    }
  }
}
