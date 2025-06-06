import process from 'node:process'
import { object, string } from 'valibot'

export default defineNuxtConfig({
  // https://nuxt.com/modules
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    'nuxt-safe-runtime-config',
    'reka-ui/nuxt',
    '@unocss/nuxt',
    'nuxt-mcp',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/content',
  ],
  devtools: { enabled: true },

  runtimeConfig: {
    github: {
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      clientId: process.env.GITHUB_CLIENT_ID || '',
    },
  },
  safeRuntimeConfig: {
    $schema: object({
      github: object({
        clientSecret: string(),
        clientId: string(),
      }),
    }),
  },

  future: { compatibilityVersion: 4 },
  compatibilityDate: '2024-07-30',

  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    database: true,
    kv: true,
    blob: true,
    ai: true,
  },

  nitro: {
    experimental: {
      tasks: true,
    },
  },

  // https://eslint.nuxt.com
  eslint: {
    config: {
      standalone: false,
    },
  },

})
