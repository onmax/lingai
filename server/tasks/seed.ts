export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed database with dummy user data',
  },
  async run() {
    console.warn('Seeding database with dummy data...')

    const db = useDrizzle()

    // Dummy user ID (this would normally come from better-auth)
    const dummyUserId = 'dummy-user-123'

    try {
      // Create dummy user profile
      await db.insert(tables.userProfiles)
        .values({
          userId: dummyUserId,
          targetLanguage: 'spanish',
        })
        .onConflictDoNothing()
        .run()

      // Add some dummy topics
      const dummyTopics = ['travel', 'food', 'business', 'culture', 'music']

      for (const topic of dummyTopics) {
        await db.insert(tables.userTopics)
          .values({
            userId: dummyUserId,
            topic,
          })
          .onConflictDoNothing()
          .run()
      }

      console.warn('Database seeded successfully!')
      return { result: 'success', userId: dummyUserId, topics: dummyTopics.length }
    }
    catch (error) {
      console.error('Error seeding database:', error)
      return { result: 'error', error: String(error) }
    }
  },
})
