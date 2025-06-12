import type { AiModels, AiOptions } from '@cloudflare/workers-types/experimental'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'pathe'

export type PromptName = 'generate-lesson' | 'generate-sentences'

export interface PromptArgs {
  ['generate-lesson']: {
    topics: string
  }
  ['generate-sentences']: {
    topics: string
    targetLanguage: string
    userLanguage: string
  }
}

export interface RunPromptArgs<T extends PromptName> {
  aiModel: keyof AiModels
  promptName: T
  promptArgs: PromptArgs[T]
  aiOptions?: Partial<AiOptions>
}

// Centralized prompt templates
const PROMPT_TEMPLATES: Record<PromptName, string> = {
  'generate-lesson': `Generate a single Spanish learning sentence for the given topics.

Create ONE sentence that:

- Uses vocabulary related to the provided topics
- Is appropriate for intermediate Spanish learners
- Is practical and realistic for real-world conversations
- Can be easily understood and practiced

The sentence should be clear, useful, and focused on the topics provided.

Return only one sentence in Spanish with its English translation.

Topics: {{ topics }}`,

  'generate-sentences': `You are a language learning content generator. Generate exactly 5 simple {{ targetLanguage }} sentences for language learning.

REQUIREMENTS:
- Use vocabulary related to the provided topics
- Appropriate for beginner to intermediate {{ targetLanguage }} learners  
- Practical and realistic for everyday conversations
- Short and easy to understand (no more than 10-12 words each)
- Each sentence should be unique and cover different aspects of the topics

Generate sentences about: {{ topics }}`,
}

// System prompts for OpenAI structured generation
export const SYSTEM_PROMPTS = {
  generateSentences: (targetLanguage: string) =>
    `You are a language learning content generator. Generate exactly 5 simple ${targetLanguage} sentences for language learning.

REQUIREMENTS:
- Use vocabulary related to the provided topics
- Appropriate for beginner to intermediate ${targetLanguage} learners  
- Practical and realistic for everyday conversations
- Short and easy to understand (no more than 10-12 words each)
- Each sentence should be unique and cover different aspects of the topics`,
}

// User prompts for OpenAI structured generation
export const USER_PROMPTS = {
  generateSentences: (topicsString: string, targetLanguage: string, userLanguage: string) =>
    `Generate 5 simple ${targetLanguage} sentences about: ${topicsString}. 
            Each sentence should be beginner-friendly and include a natural ${userLanguage} translation with usage context.`,
}

/**
 * Store prompt templates from markdown files to blob storage during startup
 * This reads .md files from server/utils/ai/prompts/ and stores them in blob storage
 */
export async function storePromptTemplates() {
  const blob = hubBlob()
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const promptsDir = resolve(currentDir, 'prompts')

  const promptNames: PromptName[] = ['generate-lesson', 'generate-sentences']

  for (const promptName of promptNames) {
    try {
      const promptPath = resolve(promptsDir, `${promptName}.md`)
      const content = await readFile(promptPath, 'utf-8')

      await blob.put(`prompts/${promptName}.md`, content, {
        addRandomSuffix: false, // Keep consistent filenames
      })
    }
    catch (error) {
      consola.error(`Failed to store prompt template '${promptName}':`, error)
    }
  }
}

export async function runPrompt<T extends PromptName>({ aiModel, promptName, promptArgs, aiOptions }: RunPromptArgs<T>) {
  const template = PROMPT_TEMPLATES[promptName]

  if (!template) {
    throw createError({
      statusCode: 404,
      statusMessage: `Prompt template '${promptName}' not found`,
    })
  }

  let prompt = template

  // Replace template variables with prompt arguments
  Object.entries(promptArgs).forEach(([key, value]) => {
    prompt = prompt.replaceAll(`{{ ${key} }}`, String(value))
  })

  const ai = hubAI()
  const response = await ai.run(aiModel, {
    prompt,
    max_tokens: 4096,
    ...aiOptions,
  })

  return response
}
