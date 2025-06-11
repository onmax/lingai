import type { AiModels, AiOptions } from '@cloudflare/workers-types/experimental'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'pathe'

export type PromptName = 'generate-lesson'

export interface PromptArgs {
  ['generate-lesson']: {
    topics: string
  }
}

export interface RunPromptArgs<T extends PromptName> {
  aiModel: keyof AiModels
  promptName: T
  promptArgs: PromptArgs[T]
  aiOptions?: Partial<AiOptions>
}

/**
 * Store prompt templates from markdown files to blob storage during startup
 * This reads .md files from server/utils/ai/prompts/ and stores them in blob storage
 */
export async function storePromptTemplates() {
  const blob = hubBlob()
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const promptsDir = resolve(currentDir, 'prompts')

  const promptNames: PromptName[] = ['generate-lesson']

  for (const promptName of promptNames) {
    try {
      const promptPath = resolve(promptsDir, `${promptName}.md`)
      const content = await readFile(promptPath, 'utf-8')

      await blob.put(`prompts/${promptName}.md`, content, {
        addRandomSuffix: false, // Keep consistent filenames
      })
    }
    catch (error) {
      console.error(`Failed to store prompt template '${promptName}':`, error)
    }
  }
}

export async function runPrompt<T extends PromptName>({ aiModel, promptName, promptArgs, aiOptions }: RunPromptArgs<T>) {
  // Read prompt from blob storage instead of file system
  const blob = hubBlob()
  const promptBlob = await blob.get(`prompts/${promptName}.md`)

  if (!promptBlob) {
    throw createError({
      statusCode: 404,
      statusMessage: `Prompt template '${promptName}' not found in blob storage`,
    })
  }

  let prompt = await promptBlob.text()

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
