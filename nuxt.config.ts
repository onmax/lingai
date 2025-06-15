import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { object, string } from 'valibot'

// Read course content
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const courseContentPath = join(__dirname, 'public/course-content.json')
const courseContent = JSON.parse(readFileSync(courseContentPath, 'utf-8'))

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
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || '',
    betterAuthUrl: process.env.BETTER_AUTH_URL || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    github: {
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      clientId: process.env.GITHUB_CLIENT_ID || '',
    },
    public: {
      courseContent,
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
      public: object({
        courseContent: object({}),
      }),
    }),
  },

  compatibilityDate: '2025-06-14',

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
      '/**': { cors: true },
    },
    devProxy: {},
    devServer: {},
  },

  // https://eslint.nuxt.com
  eslint: {
    config: {
      standalone: false,
    },
  },

})
