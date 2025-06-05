export default eventHandler(async () => {
  // Common language learning topics
  const topics = [
    'travel',
    'business',
    'food',
    'culture',
    'sports',
    'technology',
    'music',
    'movies',
    'books',
    'fashion',
    'health',
    'education',
    'family',
    'friends',
    'work',
    'hobbies',
    'art',
    'science',
    'politics',
    'environment',
    'shopping',
    'transportation',
    'weather',
    'holidays',
    'news',
  ]

  return topics.sort()
})
