import { toStandardJsonSchema } from '@valibot/to-json-schema'
import { object, string } from 'valibot'

export default defineNuxtConfig({
  runtimeConfig: toStandardJsonSchema(object({
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
  })),
})
