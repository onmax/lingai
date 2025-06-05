export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed database with initial topics and languages',
  },
  async run() {
    console.warn('Seeding database...')

    const db = useDrizzle()

    // Seed available languages
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
    ]

    // Note: Topics removed - users can add custom topics

    try {
      // Insert languages (ignore duplicates)
      for (const language of languages) {
        await db.insert(tables.availableLanguages)
          .values(language)
          .onConflictDoNothing()
          .run()
      }

      console.warn('Database seeded successfully!')
      return { result: 'success', languages: languages.length }
    }
    catch (error) {
      console.error('Error seeding database:', error)
      return { result: 'error', error: String(error) }
    }
  },
})
