import process from 'node:process'
import { storePromptTemplates } from '../utils/ai/prompts'

export default defineNitroPlugin(async () => {
  // Only run during development or when explicitly requested
  // In production (Cloudflare Workers), the file system isn't available
  if (process.env.NODE_ENV === 'development' || process.env.SETUP_PROMPTS === 'true') {
    try {
      await storePromptTemplates()
    }
    catch (error) {
      console.error('Failed to store prompt templates:', error)
    }
  }
})
