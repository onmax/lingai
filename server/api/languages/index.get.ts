export default eventHandler(async () => {
  const db = useDrizzle()

  try {
    const languages = await db.select().from(tables.availableLanguages).all()
    return languages
  }
  catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch languages',
    })
  }
})
