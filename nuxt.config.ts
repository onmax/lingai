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
  ],
  devtools: { enabled: true },

  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || '',
    betterAuthUrl: process.env.BETTER_AUTH_URL || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    github: {
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      clientId: process.env.GITHUB_CLIENT_ID || '',
    },
  },
  safeRuntimeConfig: {
    $schema: object({
      betterAuthSecret: string(),
      betterAuthUrl: string(),
      openaiApiKey: string(),
      github: object({
        clientSecret: string(),
        clientId: string(),
      }),
    }),
  },

  compatibilityDate: '2024-03-01',

  imports: {
    imports: [
      {
        name: 'default',
        as: 'consola',
        from: 'consola',
      },
    ],
  },

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
      wasm: true,
    },
    imports: {
      imports: [
        {
          name: 'default',
          as: 'consola',
          from: 'consola',
        },
      ],
    },
    routeRules: {
      '/**': { cors: true }
    },
    devProxy: {},
    devServer: {}
  },

  // https://eslint.nuxt.com
  eslint: {
    config: {
      standalone: false,
    },
  },

})
