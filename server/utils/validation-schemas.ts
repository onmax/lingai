import { object, picklist, pipe, string, transform } from 'valibot'

/**
 * Common validation schema for positive integer IDs
 */
export const idParamSchema = object({
  id: pipe(
    string(),
    transform((input) => {
      const num = Number.parseInt(input, 10)
      if (Number.isNaN(num) || num <= 0) {
        throw new Error('ID must be a positive integer')
      }
      return num
    }),
  ),
})

/**
 * Common validation schema for supported languages
 */
export const languageParamSchema = object({
  language: picklist(
    ['spanish', 'french', 'german', 'italian', 'portuguese'],
    'Supported languages: spanish, french, german, italian, portuguese',
  ),
})

/**
 * Transform a string to a positive integer
 */
export const positiveIntegerTransform = pipe(
  string(),
  transform((input) => {
    const num = Number.parseInt(input, 10)
    if (Number.isNaN(num) || num <= 0) {
      throw new Error('Must be a positive integer')
    }
    return num
  }),
)

/**
 * Supported language values
 */
export const supportedLanguages = ['spanish', 'french', 'german', 'italian', 'portuguese'] as const
