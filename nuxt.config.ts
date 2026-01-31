// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Use app/ directory structure
  srcDir: 'app/',

  // Explicitly set server directory (project root)
  serverDir: 'server/',

  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-security',
  ],

  // Global CSS
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-side only
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    databaseUrl: process.env.DATABASE_URL || '',

    // Public (exposed to client)
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },

  nitro: {
    preset: 'node-server',
  },

  devServer: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
  },

  // TypeScript configuration
  typescript: {
    strict: true,
  },
})
